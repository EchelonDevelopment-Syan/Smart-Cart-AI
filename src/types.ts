export type ProductCategory =
  | 'Produce'
  | 'Bakery'
  | 'Deli'
  | 'Dairy'
  | 'Meat'
  | 'Pantry'
  | 'Frozen'
  | 'Household'
  | 'Snacks'
  | 'Beverages'
  | 'General';

export interface ShoppingItem {
  id: string;
  item: string;
  category: ProductCategory;
  est_price: number;
  aisle: string;
  aisleNumber: number;
  isOrganic?: boolean;
  notes?: string;
  checked: boolean;
  quantity: number;
  recipeName?: string;
}

export interface DetectedRecipe {
  id: string;
  name: string;
  tagline: string;
  matchedItems: string[];
  suggestedAdditions: Array<{
    item: string;
    category: ProductCategory;
    est_price: number;
    aisle: string;
    reason: string;
  }>;
}

export interface AisleInfo {
  number: number;
  name: string;
  category: ProductCategory;
  description: string;
  zone: 'perimeter' | 'center' | 'checkout' | 'entrance';
  x: number; // 0-100% on floor plan diagram
  y: number; // 0-100% on floor plan diagram
  tip?: string;
}

export interface StoreLayout {
  id: string;
  name: string;
  type: 'typical_supermarket' | 'walmart_neighborhood';
  location: string;
  description: string;
  optimalSequence: string[];
  aisles: AisleInfo[];
}

export interface VoiceMessage {
  id: string;
  sender: 'user' | 'smartcart';
  text: string;
  timestamp: string;
  actionDetails?: string;
}

export type ActiveTab = 'cart' | 'layout' | 'transcribe' | 'recipes' | 'checkout' | 'animate';

export interface TranscriptionResult {
  transcript: string;
  confidence?: number;
  extractedItems: Array<{
    item: string;
    category: ProductCategory;
    est_price: number;
    aisle: string;
    isOrganic?: boolean;
    quantity?: number;
    notes?: string;
  }>;
  detectedRecipes?: string[];
  routeOptimizationTip?: string;
}

export type AnimationMotionStyle =
  | 'ken_burns' // Slow cinematic zoom and pan
  | 'steam_sizzle' // Hot sizzling vapor/steam particles & glow
  | 'macro_orbit' // 360 focal camera drift
  | 'culinary_glow'; // Warm appetizing culinary lighting and motion

export interface ImageAnimationProject {
  id: string;
  title: string;
  imageUrl: string;
  caption: string;
  motionStyle: AnimationMotionStyle;
  durationSeconds: number;
  includeNarration: boolean;
}

