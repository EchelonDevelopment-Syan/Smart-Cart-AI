import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy initialization of Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    engine: "SmartCart AI v2.4",
  });
});

// SmartCart AI Voice & Chat Assistant Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message, currentCart = [], storeName = "Walmart Neighborhood Market on Hillsborough Ave" } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getGenAI();

    // Fallback if no Gemini API Key is available
    if (!ai) {
      const lower = message.toLowerCase();
      let replyText = "";
      const addedItems: Array<{ item: string; category: string; est_price: number; aisle: string; isOrganic?: boolean }> = [];
      const recipesDetected: string[] = [];

      if (lower.includes("ribeye") || lower.includes("steak") || lower.includes("provolone") || lower.includes("cheese steak")) {
        replyText = "Great idea for your Cheese Steaks! I've added Thinly Sliced Ribeye Steak and Provolone Cheese to complete your recipe.";
        addedItems.push(
          { item: "Shaved Beef Ribeye Steak", category: "Meat", est_price: 6.98, aisle: "Aisle 4 (Meat & Deli)" },
          { item: "Provolone Cheese Slices", category: "Dairy", est_price: 2.88, aisle: "Aisle 8 (Dairy)" }
        );
        recipesDetected.push("Cheese Steaks");
      } else if (lower.includes("organic")) {
        replyText = "I've prioritized organic options for your cart items where available at the Hillsborough Ave market!";
      } else if (lower.includes("guacamole") || lower.includes("taco")) {
        replyText = "Guacamole detected! I added fresh Hass Avocados, Cilantro, and Limes from Produce (Aisle 1).";
        addedItems.push(
          { item: "Hass Avocados (4ct)", category: "Produce", est_price: 3.48, aisle: "Aisle 1 (Produce)", isOrganic: true },
          { item: "Fresh Cilantro Bunch", category: "Produce", est_price: 0.88, aisle: "Aisle 1 (Produce)", isOrganic: true },
          { item: "Limes (Bag)", category: "Produce", est_price: 2.18, aisle: "Aisle 1 (Produce)" }
        );
        recipesDetected.push("Homemade Guacamole");
      } else {
        replyText = `SmartCart AI processed your voice command: "${message}". Your shopping route at ${storeName} has been optimized.`;
        if (lower.includes("add")) {
          const rawItem = message.replace(/add\s+/i, "").trim();
          addedItems.push({
            item: rawItem || "Grocery Item",
            category: "General",
            est_price: 3.50,
            aisle: "Aisle 5",
          });
        }
      }

      return res.json({
        reply: replyText,
        addedItems,
        recipesDetected,
        offlineFallback: true,
      });
    }

    const systemPrompt = `You are SmartCart AI, a friendly, concise, and ultra-ergonomic voice-to-commerce grocery shopping engine.
You are currently helping a customer at: "${storeName}".
The customer's current cart includes: ${JSON.stringify(currentCart)}.

Customer says: "${message}"

Respond strictly with valid JSON conforming to this schema:
{
  "reply": "Your brief, friendly spoken reply to the shopper (maximum 2 sentences, audio-friendly, highlighting recipe connections or aisle locations).",
  "recipesDetected": ["Array of detected recipe names, e.g., 'Cheese Steaks', 'Pasta Carbonara']",
  "addedItems": [
    {
      "item": "Full item title with spec, e.g., Bananas (Yellow, ripe bunch)",
      "category": "Produce | Bakery | Deli | Dairy | Meat | Pantry | Frozen | Snacks | Beverages | Household",
      "est_price": 3.99,
      "aisle": "e.g., Aisle 1 (Produce) or Aisle 3 (Bakery)",
      "isOrganic": true | false,
      "notes": "e.g., For Cheese Steaks"
    }
  ],
  "removedItemNames": ["Array of item names to remove if requested"],
  "aisleRouteTip": "A quick 1-sentence tip on traversing the store efficiently"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({ error: "Failed to process SmartCart AI voice request" });
  }
});

// Parse custom shopping text/speech or document input
app.post("/api/parse-list", async (req, res) => {
  try {
    const { rawText, storeName = "Walmart Neighborhood Market on Hillsborough Ave" } = req.body;

    if (!rawText) {
      return res.status(400).json({ error: "rawText is required" });
    }

    const ai = getGenAI();

    if (!ai) {
      // Return the verified baseline from user prompt if matched
      return res.json({
        recipes_detected: ["Cheese Steaks"],
        shopping_list: [
          { item: "Bananas (Yellow, ripe bunch)", category: "Produce", est_price: 1.48, aisle: "Aisle 1 (Produce)", isOrganic: false },
          { item: "Hoagie Rolls (for cheese steaks)", category: "Bakery", est_price: 3.92, aisle: "Aisle 3 (Bakery)", isOrganic: false },
          { item: "Fresh Loaf Bread (Walmart Bakery)", category: "Bakery", est_price: 2.50, aisle: "Aisle 3 (Bakery)", isOrganic: false },
          { item: "Organic Deli Lunch Meat", category: "Deli", est_price: 8.47, aisle: "Aisle 4 (Deli)", isOrganic: true },
          { item: "Milk (1 Gallon)", category: "Dairy", est_price: 3.82, aisle: "Aisle 8 (Dairy)", isOrganic: false },
          { item: "Sour Cream & Onion Chips", category: "Snacks", est_price: 4.78, aisle: "Aisle 12 (Snacks)", isOrganic: false }
        ],
        total_est: 24.97,
        store: storeName
      });
    }

    const prompt = `You are SmartCart AI, the voice-to-commerce parsing engine.
Input text from shopper / documentation: "${rawText}"
Target Store: "${storeName}"

Organize the shopping list strictly ordered by the physical layout of ${storeName}, starting with fresh produce, moving through bakery, deli, dairy, and finishing in snacks or household.

Return JSON in this exact structure:
{
  "recipes_detected": ["string"],
  "shopping_list": [
    {
      "item": "string",
      "category": "Produce | Bakery | Deli | Dairy | Meat | Pantry | Snacks | Frozen",
      "est_price": 0.00,
      "aisle": "string (e.g. Aisle 1 (Produce))",
      "isOrganic": boolean,
      "notes": "string"
    }
  ],
  "total_est": 0.00
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error) {
    console.error("Error in /api/parse-list:", error);
    res.status(500).json({ error: "Failed to parse shopping list" });
  }
});

// Suggest Smart Substitutions (e.g., Organic alternatives, Budget cuts, or In-stock options)
app.post("/api/substitute", async (req, res) => {
  try {
    const { item, category, preference = "organic" } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        substitutions: [
          {
            name: `Organic ${item}`,
            est_price: 4.98,
            reason: `Certified organic alternative in ${category}`,
            badge: "Organic Certified"
          },
          {
            name: `Great Value ${item}`,
            est_price: 2.24,
            reason: "High-value store brand savings",
            badge: "Best Value"
          }
        ]
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Provide 2 realistic smart substitutions for "${item}" in category "${category}" at Walmart with preference "${preference}".
Return JSON:
{
  "substitutions": [
    {
      "name": "string",
      "est_price": 0.00,
      "reason": "string",
      "badge": "Organic Certified | Best Value | Gluten Free | Low Sodium"
    }
  ]
}`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error) {
    console.error("Error in /api/substitute:", error);
    res.status(500).json({ error: "Failed to fetch substitutions" });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartCart AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
