import React, { useState } from 'react';
import { ShoppingItem, StoreLayout } from '../types';
import { CheckCircle2, Circle, ChevronRight, ChevronLeft, MapPin, ArrowRight, Sparkles } from 'lucide-react';

interface AisleNavigatorViewProps {
  items: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onSelectItem: (item: ShoppingItem) => void;
  store: StoreLayout;
  isHighContrast: boolean;
}

export const AisleNavigatorView: React.FC<AisleNavigatorViewProps> = ({
  items,
  onToggleItem,
  onSelectItem,
  store,
  isHighContrast,
}) => {
  const [currentAisleIndex, setCurrentAisleIndex] = useState(0);

  const currentAisle = store.aisles[currentAisleIndex] || store.aisles[0];
  const nextAisle = store.aisles[currentAisleIndex + 1];
  const prevAisle = store.aisles[currentAisleIndex - 1];

  // Items in this current aisle
  const currentAisleItems = items.filter(
    (i) => i.category.toLowerCase() === currentAisle.category.toLowerCase() || i.aisleNumber === currentAisle.number
  );

  const aisleCheckedCount = currentAisleItems.filter((i) => i.checked).length;
  const isAisleComplete = currentAisleItems.length > 0 && aisleCheckedCount === currentAisleItems.length;

  return (
    <div id="aisle-navigator-view" className="space-y-4 pb-28">
      {/* Store Header Banner */}
      <div className={`rounded-3xl p-4 transition-colors ${
        isHighContrast
          ? 'bg-black text-white border-2 border-white'
          : 'bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-lg'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-300" />
            <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wide">
              Store In-Flight Navigation
            </span>
          </div>
          <span className="text-xs font-bold rounded-full bg-white/20 px-2.5 py-0.5">
            Step {currentAisleIndex + 1} of {store.aisles.length}
          </span>
        </div>

        <h2 className="mt-1 text-base font-black">{store.name}</h2>
        <p className="text-xs text-emerald-200/90">{store.location}</p>

        {/* Stepper Dots */}
        <div className="mt-3 flex items-center gap-1.5">
          {store.aisles.map((a, idx) => {
            const aisleItems = items.filter(
              (i) => i.category.toLowerCase() === a.category.toLowerCase() || i.aisleNumber === a.number
            );
            const allChecked = aisleItems.length > 0 && aisleItems.every((i) => i.checked);
            const isActive = idx === currentAisleIndex;

            return (
              <button
                key={a.number}
                onClick={() => setCurrentAisleIndex(idx)}
                className={`h-2 flex-1 rounded-full transition-all ${
                  isActive
                    ? 'bg-yellow-400'
                    : allChecked
                    ? 'bg-emerald-400'
                    : 'bg-white/30'
                }`}
                title={`Aisle ${a.number}: ${a.name}`}
              />
            );
          })}
        </div>
      </div>

      {/* Current Aisle Card */}
      <div className={`rounded-3xl border p-5 transition-colors ${
        isHighContrast
          ? 'bg-black text-white border-white'
          : 'bg-white text-slate-900 border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 text-xs font-black text-emerald-800 dark:text-emerald-300">
                Aisle {currentAisle.number}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {currentAisle.description}
              </span>
            </div>
            <h3 className="text-2xl font-black mt-1">{currentAisle.name}</h3>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Items Status</span>
            <div className="text-base font-black text-emerald-700 dark:text-emerald-400">
              {aisleCheckedCount} / {currentAisleItems.length} picked
            </div>
          </div>
        </div>

        {/* Items List for this Aisle */}
        <div className="mt-5 space-y-2.5">
          {currentAisleItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-400">
              No items in your cart from {currentAisle.name}. Feel free to skip ahead!
            </div>
          ) : (
            currentAisleItems.map((item) => (
              <div
                key={item.id}
                className={`group flex items-center justify-between rounded-2xl border p-3.5 transition-all ${
                  item.checked
                    ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs hover:border-emerald-500'
                }`}
              >
                <div
                  className="flex flex-1 items-center gap-3 cursor-pointer select-none"
                  onClick={() => onToggleItem(item.id)}
                >
                  <button
                    aria-label={`Toggle check for ${item.item}`}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform active:scale-90 ${
                      item.checked
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-300 hover:text-slate-400'
                    }`}
                  >
                    {item.checked ? (
                      <CheckCircle2 className="h-7 w-7 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="h-7 w-7 stroke-1.5" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-sm font-bold ${
                          item.checked ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {item.item}
                      </span>
                      {item.isOrganic && (
                        <span className="rounded bg-green-100 dark:bg-green-950 px-1.5 py-0.2 text-[10px] font-bold text-green-800 dark:text-green-300">
                          Organic
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span>Qty: {item.quantity}</span>
                      <span>•</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                        ${(item.est_price * item.quantity).toFixed(2)}
                      </span>
                      {item.notes && <span className="italic text-[11px] text-slate-400 font-normal">({item.notes})</span>}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectItem(item)}
                  className="rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Details
                </button>
              </div>
            ))
          )}
        </div>

        {/* Navigation Step Controls */}
        <div className="mt-6 flex items-center justify-between gap-3 border-t pt-4 border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setCurrentAisleIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentAisleIndex === 0}
            className="flex h-12 items-center gap-1 rounded-2xl border border-slate-200 dark:border-slate-800 px-4 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-30 active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Prev Aisle</span>
          </button>

          {nextAisle ? (
            <button
              onClick={() => setCurrentAisleIndex((prev) => Math.min(store.aisles.length - 1, prev + 1))}
              className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold shadow-md transition-all active:scale-95 ${
                isAisleComplete
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/25'
                  : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              }`}
            >
              <span>Go to Aisle {nextAisle.number} ({nextAisle.name})</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <div className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-white text-sm font-bold shadow-md">
              <Sparkles className="h-4 w-4" />
              <span>Route Complete! Ready to Checkout</span>
            </div>
          )}
        </div>
      </div>

      {/* Next Aisle Preview */}
      {nextAisle && (
        <div className="flex items-center justify-between rounded-2xl bg-slate-100 dark:bg-slate-900/80 px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">Up Next:</span>
            <span>Aisle {nextAisle.number} - {nextAisle.name}</span>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
        </div>
      )}
    </div>
  );
};
