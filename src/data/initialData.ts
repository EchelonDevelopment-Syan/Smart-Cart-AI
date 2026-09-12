import { ShoppingItem, DetectedRecipe, StoreLayout, VoiceMessage } from '../types';

export const INITIAL_ITEMS: ShoppingItem[] = [
  {
    id: 'item-1',
    item: 'Bananas (Yellow, ripe bunch)',
    category: 'Produce',
    est_price: 1.48,
    aisle: 'Aisle 1 - Fresh Produce',
    aisleNumber: 1,
    isOrganic: false,
    notes: 'Yellow, ripe bunch',
    checked: false,
    quantity: 1,
  },
  {
    id: 'item-2',
    item: 'Hoagie Rolls (for cheese steaks)',
    category: 'Bakery',
    est_price: 3.92,
    aisle: 'Aisle 3 - Bakery Counter',
    aisleNumber: 3,
    isOrganic: false,
    notes: 'for cheese steaks',
    checked: false,
    quantity: 1,
    recipeName: 'Cheese Steaks',
  },
  {
    id: 'item-3',
    item: 'Fresh Loaf Bread (Walmart Bakery)',
    category: 'Bakery',
    est_price: 2.50,
    aisle: 'Aisle 3 - Bakery Counter',
    aisleNumber: 3,
    isOrganic: false,
    notes: 'Walmart Bakery',
    checked: false,
    quantity: 1,
  },
  {
    id: 'item-4',
    item: 'Organic Deli Lunch Meat',
    category: 'Deli',
    est_price: 8.47,
    aisle: 'Aisle 4 - Fresh Deli & Meats',
    aisleNumber: 4,
    isOrganic: true,
    notes: 'Organic preference flagged',
    checked: false,
    quantity: 1,
  },
  {
    id: 'item-5',
    item: 'Milk (1 Gallon)',
    category: 'Dairy',
    est_price: 3.82,
    aisle: 'Aisle 8 - Dairy & Refrigerated',
    aisleNumber: 8,
    isOrganic: false,
    notes: 'Whole milk or 2%',
    checked: false,
    quantity: 1,
  },
  {
    id: 'item-6',
    item: 'Sour Cream & Onion Chips',
    category: 'Snacks',
    est_price: 4.78,
    aisle: 'Aisle 12 - Snacks & Chips',
    aisleNumber: 12,
    isOrganic: false,
    notes: 'Party size bag',
    checked: false,
    quantity: 1,
  },
];

export const INITIAL_RECIPES: DetectedRecipe[] = [
  {
    id: 'recipe-cheese-steaks',
    name: 'Cheese Steaks',
    tagline: 'Authentic Philly-style hot sandwiches',
    matchedItems: ['Hoagie Rolls (for cheese steaks)'],
    suggestedAdditions: [
      {
        item: 'Shaved Beef Ribeye Steak (1 lb)',
        category: 'Meat',
        est_price: 6.98,
        aisle: 'Aisle 4 - Fresh Deli & Meats',
        reason: 'Key protein for authentic Philadelphia cheese steaks',
      },
      {
        item: 'Provolone Cheese Slices (8 oz)',
        category: 'Dairy',
        est_price: 2.88,
        aisle: 'Aisle 8 - Dairy & Refrigerated',
        reason: 'Classic cheese steak melt topping',
      },
      {
        item: 'Yellow Sweet Onions',
        category: 'Produce',
        est_price: 1.25,
        aisle: 'Aisle 1 - Fresh Produce',
        reason: 'For sautéed smothered onion topping',
      },
      {
        item: 'Green Bell Peppers',
        category: 'Produce',
        est_price: 0.98,
        aisle: 'Aisle 1 - Fresh Produce',
        reason: 'Traditional cheese steak skillet crunch',
      },
    ],
  },
];

export const HILLSBOROUGH_STORE: StoreLayout = {
  id: 'walmart-hillsborough',
  name: 'Walmart Neighborhood Market',
  location: 'Hillsborough Ave, Tampa, FL',
  aisles: [
    { number: 1, name: 'Produce', category: 'Produce', description: 'Fresh fruits, vegetables, salad kits' },
    { number: 3, name: 'Bakery', category: 'Bakery', description: 'Fresh breads, hoagie rolls, buns, pastries' },
    { number: 4, name: 'Deli & Meats', category: 'Deli', description: 'Organic deli meats, artisan cuts, prepared meals' },
    { number: 8, name: 'Dairy', category: 'Dairy', description: 'Milk gallons, cheeses, eggs, yogurt, butter' },
    { number: 12, name: 'Snacks', category: 'Snacks', description: 'Potato chips, crackers, pretzels, nuts' },
  ],
};

export const INITIAL_VOICE_MESSAGES: VoiceMessage[] = [
  {
    id: 'msg-init',
    sender: 'smartcart',
    text: "Hello! I've processed the shopping list from your documentation. I noticed you're planning on making Cheese Steaks, so I've prioritized those hoagie rolls. I also made sure to flag your preference for Organic options at the deli counter.\n\nYour cart is organized by the layout of the Walmart Neighborhood Market on Hillsborough Ave, starting with fresh produce and finishing in the snack aisle. Your estimated total comes to $24.97. Ready to head to the store?",
    timestamp: 'Just now',
    actionDetails: '6 items mapped • Cheese Steaks detected • Organic preference noted',
  },
];

export const QUICK_VOICE_CHIPS = [
  { label: 'Add Ribeye & Provolone', query: 'Add shaved ribeye steak and provolone cheese for Cheese Steaks' },
  { label: 'Organic Alternatives', query: 'Show me organic alternatives for snacks and bread' },
  { label: 'Next Aisle Directions', query: 'Where do I go after Produce?' },
  { label: 'Soothe Story (30s)', query: 'Tell a soothing 30-second rhyming grocery story for my baby' },
  { label: 'Total Under $30?', query: 'What is my current total and how can I stay under $30?' },
];
