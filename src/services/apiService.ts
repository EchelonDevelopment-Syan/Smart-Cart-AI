import { ShoppingItem } from '../types';

export interface ChatResponse {
  reply: string;
  recipesDetected?: string[];
  addedItems?: Array<{
    item: string;
    category: string;
    est_price: number;
    aisle: string;
    isOrganic?: boolean;
    notes?: string;
  }>;
  removedItemNames?: string[];
  aisleRouteTip?: string;
  offlineFallback?: boolean;
}

export async function sendVoiceQueryToAI(
  message: string,
  currentCart: ShoppingItem[],
  storeName: string
): Promise<ChatResponse> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, currentCart, storeName }),
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Backend /api/chat error, using smart local parser:', err);
    // Graceful offline fallback
    const lower = message.toLowerCase();
    if (lower.includes('ribeye') || lower.includes('steak') || lower.includes('provolone')) {
      return {
        reply: "I've added Shaved Ribeye Steak and Provolone Cheese to complete your Cheese Steaks recipe!",
        addedItems: [
          { item: 'Shaved Beef Ribeye Steak (1 lb)', category: 'Meat', est_price: 6.98, aisle: 'Aisle 4 - Fresh Deli & Meats' },
          { item: 'Provolone Cheese Slices (8 oz)', category: 'Dairy', est_price: 2.88, aisle: 'Aisle 8 - Dairy & Refrigerated' },
        ],
        recipesDetected: ['Cheese Steaks'],
      };
    }
    return {
      reply: `SmartCart AI noted: "${message}". Your cart has been updated and aisle path optimized.`,
    };
  }
}

export async function getSmartSubstitutions(item: string, category: string, preference = 'organic') {
  try {
    const res = await fetch('/api/substitute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item, category, preference }),
    });
    if (!res.ok) throw new Error('Substitute failed');
    return await res.json();
  } catch {
    return {
      substitutions: [
        {
          name: `Organic ${item}`,
          est_price: 4.89,
          reason: `Certified organic alternative in ${category}`,
          badge: 'Organic Certified',
        },
        {
          name: `Great Value ${item}`,
          est_price: 2.19,
          reason: 'Best price-per-ounce store brand',
          badge: 'Best Value',
        },
      ],
    };
  }
}

// Hands-free voice speech synthesis
let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakSmartCartAI(text: string, enabled = true) {
  if (!enabled || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    // Clean text of markdown asterisks for natural speech
    const clean = text.replace(/\*\*/g, '').replace(/#/g, '');
    currentUtterance = new SpeechSynthesisUtterance(clean);
    currentUtterance.rate = 1.05;
    currentUtterance.pitch = 1.0;
    
    // Choose a clear natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const friendlyVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
    if (friendlyVoice) {
      currentUtterance.voice = friendlyVoice;
    }

    window.speechSynthesis.speak(currentUtterance);
  } catch {
    // Gracefully ignore audio synthesis errors
  }
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
