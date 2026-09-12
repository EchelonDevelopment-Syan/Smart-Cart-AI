import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, Check, Sparkles, Leaf, DollarSign } from 'lucide-react';
import { ShoppingItem } from '../types';
import { getSmartSubstitutions } from '../services/apiService';

interface ItemDetailSheetProps {
  item: ShoppingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateItem: (updated: ShoppingItem) => void;
  onDeleteItem: (id: string) => void;
  onApplySubstitution: (oldId: string, newItem: Partial<ShoppingItem>) => void;
  isHighContrast: boolean;
}

export const ItemDetailSheet: React.FC<ItemDetailSheetProps> = ({
  item,
  isOpen,
  onClose,
  onUpdateItem,
  onDeleteItem,
  onApplySubstitution,
  isHighContrast,
}) => {
  interface SubOption {
    name: string;
    est_price: number;
    reason: string;
    badge: string;
  }
  const [subs, setSubs] = useState<SubOption[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  useEffect(() => {
    if (item && isOpen) {
      setLoadingSubs(true);
      getSmartSubstitutions(item.item, item.category, item.isOrganic ? 'value' : 'organic')
        .then((res) => {
          setSubs(res.substitutions || []);
        })
        .finally(() => setLoadingSubs(false));
    }
  }, [item, isOpen]);

  if (!item) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          />

          {/* Bottom Sheet */}
          <motion.div
            id="item-detail-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className={`absolute bottom-0 w-full max-w-md rounded-t-3xl border-t p-5 shadow-2xl transition-colors ${
              isHighContrast
                ? 'bg-black text-white border-white'
                : 'bg-white text-slate-900 border-slate-200'
            }`}
          >
            {/* Sheet Handle */}
            <div className="flex justify-center pb-3 cursor-grab" onClick={onClose}>
              <div className="h-1.5 w-12 rounded-full bg-slate-400/50" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    {item.category}
                  </span>
                  {item.isOrganic && (
                    <span className="flex items-center gap-1 rounded-md bg-green-100 dark:bg-green-950 px-2 py-0.5 text-xs font-bold text-green-800 dark:text-green-300">
                      <Leaf className="h-3 w-3" />
                      Organic
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-lg font-bold leading-snug">{item.item}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.aisle}</p>
              </div>

              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Price & Quantity Adjuster in Ergonomic Thumb Reach */}
            <div className="mt-5 rounded-2xl bg-slate-50 dark:bg-slate-900 p-4 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Estimated Price</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white">
                  ${(item.est_price * item.quantity).toFixed(2)}
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  (${item.est_price.toFixed(2)} each)
                </span>
              </div>

              {/* Quantity steppers (Large touch targets for one-handed operation) */}
              <div className="flex items-center gap-3">
                <button
                  id="decrement-qty-btn"
                  onClick={() => {
                    if (item.quantity > 1) {
                      onUpdateItem({ ...item, quantity: item.quantity - 1 });
                    }
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 active:scale-95 shadow-xs"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center text-lg font-bold">{item.quantity}</span>
                <button
                  id="increment-qty-btn"
                  onClick={() => onUpdateItem({ ...item, quantity: item.quantity + 1 })}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 active:scale-95 shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Smart Substitutions AI Section */}
            <div className="mt-4">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>Smart Substitutions (Hillsborough Ave)</span>
              </div>

              {loadingSubs ? (
                <div className="py-4 text-center text-xs text-slate-400 animate-pulse">
                  Checking store shelves for alternatives...
                </div>
              ) : (
                <div className="space-y-2">
                  {subs.map((sub, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 hover:border-emerald-500 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">
                            {sub.name}
                          </span>
                          <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                            {sub.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{sub.reason}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          ${sub.est_price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => {
                            onApplySubstitution(item.id, {
                              item: sub.name,
                              est_price: sub.est_price,
                              isOrganic: sub.badge.includes('Organic'),
                            });
                            onClose();
                          }}
                          className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white active:scale-95 shadow-xs"
                        >
                          Swap
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 flex gap-3 pt-2">
              <button
                onClick={() => {
                  onUpdateItem({ ...item, checked: !item.checked });
                  onClose();
                }}
                className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold shadow-md active:scale-95 transition-all ${
                  item.checked
                    ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                <Check className="h-4 w-4" />
                <span>{item.checked ? 'Mark Unchecked' : 'Mark as Picked Up'}</span>
              </button>

              <button
                id="delete-item-btn"
                onClick={() => {
                  onDeleteItem(item.id);
                  onClose();
                }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400 active:scale-95"
                title="Remove item"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
