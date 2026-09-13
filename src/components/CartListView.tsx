import React, { useState } from 'react';
import { ShoppingItem, ProductCategory, DetectedRecipe } from '../types';
import {
  CheckCircle2,
  Circle,
  Sparkles,
  ChefHat,
  Leaf,
  Plus,
  Minus,
  ArrowRight,
  Mic,
  Film,
  Compass,
  ShoppingCart,
  FileAudio,
  Trash2,
  RotateCcw,
} from 'lucide-react';

export interface CartListViewProps {
  items?: ShoppingItem[];
  recipes?: DetectedRecipe[];
  onToggleItem?: (id: string) => void;
  onSelectItem?: (item: ShoppingItem) => void;
  onOpenVoice?: () => void;
  onOpenRecipe?: () => void;
  onStartStoreRoute?: () => void;
  onUpdateQuantity?: (id: string, delta: number) => void;
  onClearCart?: () => void;
  onLoadSampleList?: () => void;
  onAddSingleItem?: (name: string) => void;
  onNavigateToTranscribe?: () => void;
  onNavigateToAnimate?: () => void;
  onNavigateToLayout?: () => void;
  storeName?: string;
  isHighContrast?: boolean;
}

const CATEGORY_ORDER: ProductCategory[] = [
  'Produce',
  'Bakery',
  'Meat',
  'Deli',
  'Dairy',
  'Pantry',
  'Frozen',
  'Household',
  'Snacks',
  'Beverages',
  'General',
];

export const CartListView: React.FC<CartListViewProps> = ({
  items = [],
  recipes = [],
  onToggleItem = (_id: string) => {},
  onSelectItem = (_item: ShoppingItem) => {},
  onOpenVoice = () => {},
  onOpenRecipe = () => {},
  onStartStoreRoute = () => {},
  onUpdateQuantity,
  onClearCart,
  onLoadSampleList,
  onAddSingleItem,
  onNavigateToTranscribe,
  onNavigateToAnimate,
  onNavigateToLayout,
  storeName = 'Walmart Hillsborough Ave',
  isHighContrast = false,
}) => {
  const [quickItemText, setQuickItemText] = useState('');
  const safeItems = Array.isArray(items) ? items : [];
  const totalEst = safeItems.reduce((sum, i) => sum + (i.est_price || 0) * (i.quantity || 1), 0);
  const checkedCount = safeItems.filter((i) => i.checked).length;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickItemText.trim()) return;
    onAddSingleItem?.(quickItemText.trim());
    setQuickItemText('');
  };

  // Group items by category according to common store aisles
  const groupedItems = CATEGORY_ORDER.reduce((acc, cat) => {
    const catItems = safeItems.filter((i) => i.category === cat);
    if (catItems.length > 0) {
      acc.push({ category: cat, items: catItems });
    }
    return acc;
  }, [] as Array<{ category: ProductCategory; items: ShoppingItem[] }>);

  return (
    <div
      id="cart-list-view"
      role="container"
      data-testid="cart-list-view"
      className="space-y-4 pb-28"
    >
      {/* Top Banner: Store Layout & Cart Status */}
      <div className={`rounded-3xl p-4 transition-colors ${
        isHighContrast
          ? 'bg-black text-white border-2 border-white'
          : 'bg-emerald-900 text-white shadow-md'
      }`}>
        <div className="flex items-center justify-between text-xs font-semibold text-emerald-200">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
            {safeItems.length === 0 ? 'Fresh Grocery List' : 'Grouped by Common Store Aisles'}
          </span>
          <div className="flex items-center gap-2">
            {safeItems.length > 0 && onClearCart && (
              <button
                type="button"
                onClick={onClearCart}
                className="flex items-center gap-1 rounded-full bg-emerald-800/80 hover:bg-red-800/90 px-2.5 py-0.5 text-[10px] font-bold text-white transition-colors active:scale-95"
                title="Empty cart for a fresh list"
              >
                <Trash2 className="h-3 w-3" />
                <span>Empty Cart</span>
              </button>
            )}
            <span className="rounded-full bg-emerald-800/80 px-2 py-0.5 text-[11px] font-bold">
              {checkedCount}/{safeItems.length} Checked
            </span>
          </div>
        </div>

        <h2 className="mt-1 text-base font-black tracking-tight">{storeName}</h2>

        {/* Quick Action Shortcuts */}
        <div className="mt-3 flex flex-wrap gap-2">
          {onNavigateToTranscribe && (
            <button
              onClick={onNavigateToTranscribe}
              className="flex items-center gap-1.5 rounded-xl bg-teal-500/20 border border-teal-300/40 px-2.5 py-1.5 text-xs font-bold text-teal-200 hover:bg-teal-500/30 transition-all active:scale-95"
            >
              <Mic className="h-3.5 w-3.5 text-teal-300" />
              <span>Transcribe Audio</span>
            </button>
          )}

          {onNavigateToAnimate && (
            <button
              onClick={onNavigateToAnimate}
              className="flex items-center gap-1.5 rounded-xl bg-orange-500/20 border border-orange-300/40 px-2.5 py-1.5 text-xs font-bold text-orange-200 hover:bg-orange-500/30 transition-all active:scale-95"
            >
              <Film className="h-3.5 w-3.5 text-orange-300" />
              <span>Animate Images into Video</span>
            </button>
          )}

          {onNavigateToLayout && (
            <button
              onClick={onNavigateToLayout}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-300/40 px-2.5 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-500/30 transition-all active:scale-95"
            >
              <Compass className="h-3.5 w-3.5 text-emerald-300" />
              <span>Suggested Store Layout</span>
            </button>
          )}
        </div>

        {/* Dynamic Recipe & Organic Callouts - only shown if present */}
        {((recipes && recipes.length > 0) || safeItems.some((i) => i.isOrganic)) && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {recipes && recipes.length > 0 && (
              <button
                onClick={onOpenRecipe}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500/25 border border-amber-400/40 px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/35 transition-all active:scale-95"
              >
                <ChefHat className="h-4 w-4 text-amber-300" />
                <span>Recipe: {recipes[0].name}</span>
                <ArrowRight className="h-3 w-3 opacity-70" />
              </button>
            )}

            {safeItems.some((i) => i.isOrganic) && (
              <div className="flex items-center gap-1 rounded-xl bg-emerald-800/80 px-2.5 py-1 text-xs font-medium text-emerald-100">
                <Leaf className="h-3.5 w-3.5 text-green-300" />
                <span>Organic preference flagged</span>
              </div>
            )}
          </div>
        )}

        {/* Total & Start Walk CTA */}
        <div className="mt-4 flex items-center justify-between border-t border-emerald-800/70 pt-3">
          <div>
            <span className="text-[11px] font-medium text-emerald-300 uppercase tracking-wider">
              Estimated Total
            </span>
            <div className="text-2xl font-black text-white">${totalEst.toFixed(2)}</div>
          </div>

          {safeItems.length > 0 ? (
            <button
              id="ready-to-head-to-store-btn"
              onClick={onStartStoreRoute}
              className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-black text-emerald-950 shadow-lg hover:bg-emerald-50 active:scale-95 transition-transform"
            >
              <span>Optimized Route Walk</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-medium">
              <span>Cart is empty & fresh</span>
            </div>
          )}
        </div>
      </div>

      {/* Empty State when no items in cart */}
      {safeItems.length === 0 && (
        <div
          data-testid="empty-cart-state"
          className={`rounded-3xl border border-dashed p-6 sm:p-8 text-center transition-colors ${
            isHighContrast
              ? 'border-zinc-700 bg-zinc-950 text-white'
              : 'border-slate-200 bg-white text-slate-600 shadow-2xs'
          }`}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mb-3">
            <ShoppingCart className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Your Cart is Empty</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            Your shopping list is clean and fresh. Add grocery items using your voice, type below, or transcribe an audio memo.
          </p>

          {/* Quick Add Form directly on empty cart */}
          <form onSubmit={handleQuickAdd} className="mt-4 flex gap-2 max-w-sm mx-auto">
            <input
              type="text"
              value={quickItemText}
              onChange={(e) => setQuickItemText(e.target.value)}
              placeholder="Add item (e.g., Gala Apples, Whole Milk)..."
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!quickItemText.trim()}
              className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-40 active:scale-95 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Popular Fresh Staples Quick Chips */}
          <div className="mt-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick Add Staples:</span>
            <div className="mt-1.5 flex flex-wrap justify-center gap-1.5">
              {[
                'Fresh Bananas',
                'Whole Milk',
                'Dozen Eggs',
                'Sourdough Bread',
                'Avocados',
              ].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => onAddSingleItem?.(sample)}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:hover:bg-emerald-950 transition-all active:scale-95"
                >
                  + {sample}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              onClick={onOpenVoice}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <Mic className="h-3.5 w-3.5" />
              <span>Voice Add</span>
            </button>
            {onNavigateToTranscribe && (
              <button
                onClick={onNavigateToTranscribe}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
              >
                <FileAudio className="h-3.5 w-3.5 text-teal-500" />
                <span>Transcribe Memo</span>
              </button>
            )}
            {onLoadSampleList && (
              <button
                onClick={onLoadSampleList}
                className="flex items-center gap-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 active:scale-95 transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Load Sample Items</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Add Bar & Empty Cart Controls when items are present */}
      {safeItems.length > 0 && (
        <div className="flex items-center justify-between gap-2 px-1">
          <form onSubmit={handleQuickAdd} className="flex flex-1 items-center gap-2">
            <input
              type="text"
              value={quickItemText}
              onChange={(e) => setQuickItemText(e.target.value)}
              placeholder="Add another item to list..."
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!quickItemText.trim()}
              className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors shrink-0"
            >
              + Add
            </button>
          </form>

          {onClearCart && (
            <button
              onClick={onClearCart}
              className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:text-red-600 hover:border-red-200 dark:hover:border-red-900 transition-colors shrink-0"
              title="Empty entire cart"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-500" />
              <span>Empty</span>
            </button>
          )}
        </div>
      )}

      {/* Cart Sections Ordered by Store Layout */}
      {safeItems.length > 0 && (
        <div className="space-y-4">
          {groupedItems.map(({ category, items: catItems }) => (
            <div
              key={category}
              className={`rounded-3xl border p-4 transition-colors ${
                isHighContrast
                  ? 'bg-black text-white border-white'
                  : 'bg-white text-slate-900 border-slate-200 shadow-2xs'
              }`}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    {category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    ({catItems[0]?.aisle || 'Store Floor'})
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {catItems.length} {catItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Category Items */}
              <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800/70">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                  >
                    <div
                      className="flex flex-1 items-center gap-3 cursor-pointer select-none"
                      onClick={() => onToggleItem(item.id)}
                    >
                      <button
                        aria-label={`Mark ${item.item}`}
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform active:scale-90 ${
                          item.checked
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-300 hover:text-slate-400'
                        }`}
                      >
                        {item.checked ? (
                          <CheckCircle2 className="h-6 w-6 fill-emerald-100 dark:fill-emerald-950" />
                        ) : (
                          <Circle className="h-6 w-6 stroke-1.5" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-sm font-bold ${
                              item.checked
                                ? 'line-through text-slate-400'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {item.item}
                          </span>
                          {item.isOrganic && (
                            <span className="rounded bg-green-100 dark:bg-green-950 px-1.5 py-0.2 text-[10px] font-bold text-green-800 dark:text-green-300">
                              Organic
                            </span>
                          )}
                          {item.recipeName && (
                            <span className="rounded bg-amber-100 dark:bg-amber-950 px-1.5 py-0.2 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                              {item.recipeName}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          {item.quantity > 1 && <span>Qty: {item.quantity}</span>}
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            ${(item.est_price * item.quantity).toFixed(2)}
                          </span>
                          {item.notes && (
                            <span className="text-[11px] text-slate-400 italic">({item.notes})</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                      {onUpdateQuantity && (
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 mr-1">
                          <button
                            type="button"
                            aria-label={`Decrease ${item.item} quantity`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateQuantity(item.id, -1);
                            }}
                            className="h-6 w-6 flex items-center justify-center rounded text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold px-1 min-w-[14px] text-center text-slate-700 dark:text-slate-200">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase ${item.item} quantity`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateQuantity(item.id, 1);
                            }}
                            className="h-6 w-6 flex items-center justify-center rounded text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => onSelectItem(item)}
                        className="rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Prompt Bar for Easy One-Handed Voice Access */}
      <div className="pt-2">
        <button
          onClick={onOpenVoice}
          className={`w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed py-3.5 text-xs font-bold transition-all active:scale-95 ${
            isHighContrast
              ? 'border-white text-white bg-zinc-900'
              : 'border-emerald-300 bg-emerald-50/50 text-emerald-800 hover:bg-emerald-50'
          }`}
        >
          <Plus className="h-4 w-4" />
          <span>Tell SmartCart AI to add an item or recipe</span>
        </button>
      </div>
    </div>
  );
};

export default CartListView;
