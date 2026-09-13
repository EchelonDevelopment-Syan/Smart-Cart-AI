/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  ShoppingItem,
  DetectedRecipe,
  ActiveTab,
  VoiceMessage,
} from './types';
import {
  INITIAL_ITEMS,
  INITIAL_RECIPES,
  HILLSBOROUGH_STORE,
  INITIAL_VOICE_MESSAGES,
} from './data/initialData';
import { ThumbZoneNav } from './components/ThumbZoneNav';
import { CartListView } from './components/CartListView';
import { StoreLayoutView } from './components/StoreLayoutView';
import { AudioTranscribeView } from './components/AudioTranscribeView';
import { ImageToVideoView } from './components/ImageToVideoView';
import { RecipesView } from './components/RecipesView';
import { CheckoutView } from './components/CheckoutView';
import { VoiceAssistantSheet } from './components/VoiceAssistantSheet';
import { ItemDetailSheet } from './components/ItemDetailSheet';
import { RecipeDetectiveSheet } from './components/RecipeDetectiveSheet';
import { Sparkles, Store, Mic, Sun, Moon, FileAudio } from 'lucide-react';

export default function App() {
  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('smartcart_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [recipes, setRecipes] = useState<DetectedRecipe[]>(() => {
    const saved = localStorage.getItem('smartcart_recipes');
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('cart');
  const [voiceSheetOpen, setVoiceSheetOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ShoppingItem | null>(null);
  const [activeRecipe, setActiveRecipe] = useState<DetectedRecipe | null>(null);
  const [recipeSheetOpen, setRecipeSheetOpen] = useState(false);

  // Visual acuity / in-store high contrast mode
  const [isHighContrast, setIsHighContrast] = useState(false);

  // Voice Chat conversation
  const [messages, setMessages] = useState<VoiceMessage[]>(INITIAL_VOICE_MESSAGES);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('smartcart_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('smartcart_recipes', JSON.stringify(recipes));
  }, [recipes]);

  // Handle toggling check on item
  const handleToggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i))
    );
  };

  // Handle item update
  const handleUpdateItem = (updated: ShoppingItem) => {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setSelectedItem(null);
  };

  // Handle item deletion
  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedItem(null);
  };

  // Handle substitution
  const handleApplySubstitution = (oldId: string, patch: Partial<ShoppingItem>) => {
    setItems((prev) =>
      prev.map((i) => (i.id === oldId ? { ...i, ...patch } : i))
    );
    setSelectedItem(null);
  };

  // Handle adding items from Voice or Recipe additions
  const handleAddItems = (
    newItems: Array<Omit<ShoppingItem, 'id' | 'checked' | 'quantity'>>
  ) => {
    const added: ShoppingItem[] = newItems.map((n, idx) => ({
      ...n,
      id: `item-${Date.now()}-${idx}`,
      checked: false,
      quantity: 1,
    }));
    setItems((prev) => [...prev, ...added]);
  };

  // Handle removal by name
  const handleRemoveItemByName = (name: string) => {
    const lower = name.toLowerCase();
    setItems((prev) => prev.filter((i) => !i.item.toLowerCase().includes(lower)));
  };

  // Handle adding recipe suggested additions
  const handleAddRecipeAddition = (
    addition: DetectedRecipe['suggestedAdditions'][0]
  ) => {
    const newItem: ShoppingItem = {
      id: `item-sug-${Date.now()}`,
      item: addition.item,
      category: addition.category,
      est_price: addition.est_price,
      aisle: addition.aisle,
      aisleNumber: parseInt(addition.aisle.replace(/\D/g, '') || '1') || 1,
      checked: false,
      quantity: 1,
      recipeName: 'Cheese Steaks',
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleAddAllRecipeAdditions = (
    additions: DetectedRecipe['suggestedAdditions']
  ) => {
    const newItems: ShoppingItem[] = additions.map((add, idx) => ({
      id: `item-sug-${Date.now()}-${idx}`,
      item: add.item,
      category: add.category,
      est_price: add.est_price,
      aisle: add.aisle,
      aisleNumber: parseInt(add.aisle.replace(/\D/g, '') || '1') || 1,
      checked: false,
      quantity: 1,
      recipeName: 'Cheese Steaks',
    }));
    setItems((prev) => [...prev, ...newItems]);
  };

  return (
    <div
      id="smartcart-app-root"
      className={`min-h-screen w-full transition-colors duration-300 font-sans ${
        isHighContrast
          ? 'bg-black text-white'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* App Max-Width Wrapper for One-Handed Mobile Ergonomics */}
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pt-3 pb-24 relative">
        {/* Top Header Bar */}
        <header className="mb-3 flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-xs ${
                isHighContrast
                  ? 'bg-yellow-400 text-black font-black'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black tracking-tight leading-none">
                  SmartCart AI
                </h1>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                  Voice Engine
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                <Store className="h-3 w-3" />
                <span>Walmart Hillsborough Ave</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Transcribe button */}
            <button
              onClick={() => setActiveTab('transcribe')}
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all active:scale-90 ${
                activeTab === 'transcribe'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
              title="Transcribe Audio Shopping Memo"
            >
              <FileAudio className="h-4 w-4" />
            </button>

            {/* Quick Mic button in header */}
            <button
              onClick={() => setVoiceSheetOpen(true)}
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all active:scale-90 ${
                isHighContrast
                  ? 'bg-yellow-400 text-black'
                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
              title="Speak with SmartCart AI"
            >
              <Mic className="h-4 w-4" />
            </button>

            {/* High Contrast / Night Vision Toggle */}
            <button
              onClick={() => setIsHighContrast(!isHighContrast)}
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all active:scale-90 ${
                isHighContrast
                  ? 'bg-yellow-400 text-black font-black'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
              title="Toggle High Contrast Display"
            >
              {isHighContrast ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Tab Content Display */}
        <main className="flex-1">
          {activeTab === 'cart' && (
            <CartListView
              items={items}
              onToggleItem={handleToggleItem}
              onSelectItem={(item) => setSelectedItem(item)}
              onOpenVoice={() => setVoiceSheetOpen(true)}
              onOpenRecipe={() => {
                setActiveRecipe(recipes[0] || null);
                setRecipeSheetOpen(true);
              }}
              onStartStoreRoute={() => setActiveTab('layout')}
              onNavigateToTranscribe={() => setActiveTab('transcribe')}
              onNavigateToAnimate={() => setActiveTab('animate')}
              onNavigateToLayout={() => setActiveTab('layout')}
              storeName={HILLSBOROUGH_STORE.name}
              isHighContrast={isHighContrast}
            />
          )}

          {activeTab === 'layout' && (
            <StoreLayoutView
              items={items}
              onToggleItem={handleToggleItem}
              isHighContrast={isHighContrast}
            />
          )}

          {activeTab === 'transcribe' && (
            <AudioTranscribeView
              onAddItems={handleAddItems}
              onNavigateToLayout={() => setActiveTab('layout')}
              isHighContrast={isHighContrast}
              storeName={HILLSBOROUGH_STORE.name}
            />
          )}

          {activeTab === 'recipes' && (
            <RecipesView
              recipes={recipes}
              cartItems={items}
              onOpenRecipeDetail={(rec) => {
                setActiveRecipe(rec);
                setRecipeSheetOpen(true);
              }}
              onAddAddition={handleAddRecipeAddition}
              onOpenVoice={() => setVoiceSheetOpen(true)}
              isHighContrast={isHighContrast}
            />
          )}

          {activeTab === 'checkout' && (
            <CheckoutView
              items={items}
              storeName={HILLSBOROUGH_STORE.name}
              isHighContrast={isHighContrast}
              onClearCart={() => setItems([])}
            />
          )}

          {activeTab === 'animate' && (
            <ImageToVideoView
              isHighContrast={isHighContrast}
            />
          )}
        </main>

        {/* Bottom Thumb Zone Navigation Bar */}
        <ThumbZoneNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenVoice={() => setVoiceSheetOpen(true)}
          cartItemCount={items.length}
          hasUncheckedItems={items.some((i) => !i.checked)}
          recipesCount={recipes.length}
          isHighContrast={isHighContrast}
        />

        {/* Modal Bottom Sheets */}
        <VoiceAssistantSheet
          isOpen={voiceSheetOpen}
          onClose={() => setVoiceSheetOpen(false)}
          messages={messages}
          onAddMessage={(msg) => setMessages((prev) => [...prev, msg])}
          cartItems={items}
          onAddItems={handleAddItems}
          onRemoveItemByName={handleRemoveItemByName}
          storeName={HILLSBOROUGH_STORE.name}
          isHighContrast={isHighContrast}
        />

        <ItemDetailSheet
          item={selectedItem}
          isOpen={Boolean(selectedItem)}
          onClose={() => setSelectedItem(null)}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onApplySubstitution={handleApplySubstitution}
          isHighContrast={isHighContrast}
        />

        <RecipeDetectiveSheet
          recipe={activeRecipe}
          isOpen={recipeSheetOpen}
          onClose={() => setRecipeSheetOpen(false)}
          cartItems={items}
          onAddAddition={handleAddRecipeAddition}
          onAddAllAdditions={handleAddAllRecipeAdditions}
          isHighContrast={isHighContrast}
        />
      </div>
    </div>
  );
}
