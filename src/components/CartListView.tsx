import React from 'react';
import { ShoppingItem, ProductCategory } from '../types';
import { CheckCircle2, Circle, Sparkles, ChefHat, Leaf, Plus, ArrowRight } from 'lucide-react';

interface CartListViewProps {
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onSelectItem: (item: ShoppingItem) => void;
  onOpenVoice: () => void;
  onOpenRecipe: () => void;
  onStartStoreRoute: () => void;
  storeName: string;
  isHighContrast: boolean;
}

const CATEGORY_ORDER: ProductCategory[] = [
  'Produce',
  'Bakery',
  'Deli',
  'Dairy',
  'Meat',
  'Snacks',
  'Pantry',
  'Frozen',
  'General',
];

export const CartListView: React.FC<CartListViewProps> = ({
  items,
  onToggleItem,
  onSelectItem,
  onOpenVoice,
  onOpenRecipe,
  onStartStoreRoute,
  storeName,
  isHighContrast,
}) => {
  const totalEst = items.reduce((sum, i) => sum + i.est_price * i.quantity, 0);
  const checkedCount = items.filter((i) => i.checked).length;

  // Group items by category according to Walmart Hillsborough physical store layout
  const groupedItems = CATEGORY_ORDER.reduce((acc, cat) => {
    const catItems = items.filter((i) => i.category === cat);
    if (catItems.length > 0) {
      acc.push({ category: cat, items: catItems });
    }
    return acc;
  }, [] as Array<{ category: ProductCategory; items: ShoppingItem[] }>);

  return (
    <div id="cart-list-view" className="space-y-4 pb-28">
      {/* Top Banner: Store Layout & Detected Recipe Alert */}
      <div className={`rounded-3xl p-4 transition-colors ${
        isHighContrast
          ? 'bg-black text-white border-2 border-white'
          : 'bg-emerald-900 text-white shadow-md'
      }`}>
        <div className="flex items-center justify-between text-xs font-semibold text-emerald-200">
          <span className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
            Organized by Store Layout
          </span>
          <span className="rounded-full bg-emerald-800/80 px-2 py-0.5 text-[11px] font-bold">
            {checkedCount}/{items.length} Checked
          </span>
        </div>

        <h2 className="mt-1 text-base font-black tracking-tight">{storeName}</h2>

        {/* Recipe & Preference Callouts */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={onOpenRecipe}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500/25 border border-amber-400/40 px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/35 transition-all active:scale-95"
          >
            <ChefHat className="h-4 w-4 text-amber-300" />
            <span>Recipe: Cheese Steaks (Hoagie rolls prioritized)</span>
            <ArrowRight className="h-3 w-3 opacity-70" />
          </button>

          <div className="flex items-center gap-1 rounded-xl bg-emerald-800/80 px-2.5 py-1 text-xs font-medium text-emerald-100">
            <Leaf className="h-3.5 w-3.5 text-green-300" />
            <span>Organic preference flagged at Deli</span>
          </div>
        </div>

        {/* Total & Start Walk CTA */}
        <div className="mt-4 flex items-center justify-between border-t border-emerald-800/70 pt-3">
          <div>
            <span className="text-[11px] font-medium text-emerald-300 uppercase tracking-wider">
              Estimated Total
            </span>
            <div className="text-2xl font-black text-white">${totalEst.toFixed(2)}</div>
          </div>

          <button
            id="ready-to-head-to-store-btn"
            onClick={onStartStoreRoute}
            className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-black text-emerald-950 shadow-lg hover:bg-emerald-50 active:scale-95 transition-transform"
          >
            <span>Ready to head to store?</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Cart Sections Ordered by Store Layout */}
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

                  <button
                    onClick={() => onSelectItem(item)}
                    className="ml-2 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

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
