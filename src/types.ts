export type ProductCategory =
  | 'Produce'
  | 'Bakery'
  | 'Deli'
  | 'Dairy'
  | 'Meat'
  | 'Snacks'
  | 'Pantry'
  | 'Frozen'
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

export interface StoreLayout {
  id: string;
  name: string;
  location: string;
  aisles: Array<{
    number: number;
    name: string;
    category: ProductCategory;
    description: string;
  }>;
}

export interface VoiceMessage {
  id: string;
  sender: 'user' | 'smartcart';
  text: string;
  timestamp: string;
  actionDetails?: string;
}

export type ActiveTab = 'cart' | 'aisle' | 'recipes' | 'soothe';
