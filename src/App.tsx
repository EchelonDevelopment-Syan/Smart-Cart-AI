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
import { soundEngine } from './services/soundService';
import { ThumbZoneNav } from './components/ThumbZoneNav';
import { AudioBar } from './components/AudioBar';
import { CartListView } from './components/CartListView';
import { AisleNavigatorView } from './components/AisleNavigatorView';
import { RecipesView } from './components/RecipesView';
import { SootheView } from './components/SootheView';
import { VoiceAssistantSheet } from './components/VoiceAssistantSheet';
import { ItemDetailSheet } from './components/ItemDetailSheet';
import { RecipeDetectiveSheet } from './components/RecipeDetectiveSheet';
import { Sparkles, Store, Mic, Moon } from 'lucide-react';

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

  // Audio persistence
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.25);

  // Visual acuity mode
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

  // Audio synthesize toggle
  const handleToggleAudio = () => {
    if (isAudioPlaying) {
      soundEngine.stop();
      setIsAudioPlaying(false);
    } else {
      soundEngine.start();
      setIsAudioPlaying(true);
    }
  };

  const handleStopAudio = () => {
    soundEngine.stop();
    setIsAudioPlaying(false);
  };

  return (
    <div
      id="smartcart-app-root"
      className={`min-h-screen w-full transition-colors duration-300 font-sans ${
        isHighContrast
          ? 'bg-black text-white'
          : activeTab === 'soothe'
          ? 'bg-[#04040e] text-slate-100'
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

            {/* Night / Soothe Quick Toggle */}
            <button
              onClick={() => setActiveTab((prev) => (prev === 'soothe' ? 'cart' : 'soothe'))}
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all active:scale-90 ${
                activeTab === 'soothe'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300'
              }`}
              title="Toggle Soothe Mode"
            >
              <Moon className="h-4 w-4" />
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
              onStartStoreRoute={() => setActiveTab('aisle')}
              storeName={HILLSBOROUGH_STORE.name}
              isHighContrast={isHighContrast}
            />
          )}

          {activeTab === 'aisle' && (
            <AisleNavigatorView
              items={items}
              onToggleItem={handleToggleItem}
              onSelectItem={(item) => setSelectedItem(item)}
              store={HILLSBOROUGH_STORE}
              isHighContrast={isHighContrast}
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

          {activeTab === 'soothe' && (
            <SootheView
              isAudioPlaying={isAudioPlaying}
              onToggleAudio={handleToggleAudio}
              volume={audioVolume}
              onVolumeChange={setAudioVolume}
              isHighContrast={isHighContrast}
              onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
            />
          )}
        </main>

        {/* Persistent 60 BPM Audio Bar directly above bottom nav when playing */}
        <AudioBar
          isPlaying={isAudioPlaying && activeTab !== 'soothe'}
          onStop={handleStopAudio}
          volume={audioVolume}
          onVolumeChange={setAudioVolume}
        />

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
