import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChefHat, Check, Plus, Clock, Sparkles } from 'lucide-react';
import { DetectedRecipe, ShoppingItem } from '../types';

interface RecipeDetectiveSheetProps {
  recipe: DetectedRecipe | null;
  isOpen: boolean;
  onClose: () => void;
  cartItems: ShoppingItem[];
  onAddAddition: (item: DetectedRecipe['suggestedAdditions'][0]) => void;
  onAddAllAdditions: (additions: DetectedRecipe['suggestedAdditions']) => void;
  isHighContrast: boolean;
}

export const RecipeDetectiveSheet: React.FC<RecipeDetectiveSheetProps> = ({
  recipe,
  isOpen,
  onClose,
  cartItems,
  onAddAddition,
  onAddAllAdditions,
  isHighContrast,
}) => {
  if (!recipe) return null;

  // Filter out additions that are already in the cart
  const unadded = recipe.suggestedAdditions.filter(
    (sug) => !cartItems.some((ci) => ci.item.toLowerCase().includes(sug.item.split(' ')[0].toLowerCase()))
  );

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
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Bottom Sheet */}
          <motion.div
            id="recipe-detective-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className={`absolute bottom-0 w-full max-w-md rounded-t-3xl border-t p-5 shadow-2xl max-h-[85vh] flex flex-col transition-colors ${
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
            <div className="flex items-start justify-between border-b pb-4 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <ChefHat className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Recipe Detected
                    </span>
                  </div>
                  <h2 className="text-xl font-black">{recipe.name}</h2>
                  <p className="text-xs text-slate-500">{recipe.tagline}</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {/* Items already secured in cart */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Already in Cart for this recipe</span>
                </h3>
                <div className="space-y-1.5">
                  {recipe.matchedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-3.5 py-2.5 text-sm"
                    >
                      <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                        {item}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        Secured in Cart
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Additions to Complete Recipe */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>Missing Ingredients ({unadded.length})</span>
                  </h3>
                  {unadded.length > 0 && (
                    <button
                      onClick={() => onAddAllAdditions(unadded)}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
                    >
                      Add All ({unadded.length})
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {recipe.suggestedAdditions.map((sug, idx) => {
                    const alreadyIn = cartItems.some((ci) =>
                      ci.item.toLowerCase().includes(sug.item.split(' ')[0].toLowerCase())
                    );
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between rounded-xl border p-3 transition-colors ${
                          alreadyIn
                            ? 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500 shadow-2xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{sug.item}</span>
                            <span className="text-xs font-bold text-emerald-600">
                              ${sug.est_price.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">{sug.reason}</p>
                          <span className="text-[10px] font-medium text-slate-400">
                            Location: {sug.aisle}
                          </span>
                        </div>

                        {alreadyIn ? (
                          <div className="flex items-center gap-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 px-2 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                            <Check className="h-3.5 w-3.5" />
                            <span>In Cart</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => onAddAddition(sug)}
                            className="flex items-center gap-1 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black px-3 py-1.5 text-xs font-bold shadow-xs active:scale-95"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Cooking Tip */}
              <div className="rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3.5 text-xs text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Chef's Note (15-Minute Meal)</span>
                </div>
                <p className="leading-relaxed">
                  Brown the shaved ribeye on high heat, sauté with sweet onions and bell peppers, lay provolone cheese on top until melted, and scoop directly into the warm Hoagie Rolls!
                </p>
              </div>
            </div>

            {/* Bottom Complete Button */}
            {unadded.length > 0 && (
              <div className="pt-2">
                <button
                  id="add-all-recipe-items-btn"
                  onClick={() => {
                    onAddAllAdditions(unadded);
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>
                    Add All Missing Ingredients ($
                    {unadded.reduce((acc, i) => acc + i.est_price, 0).toFixed(2)})
                  </span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
