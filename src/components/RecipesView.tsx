import React from 'react';
import { ChefHat, Sparkles, Plus, Check, ArrowRight } from 'lucide-react';
import { DetectedRecipe, ShoppingItem } from '../types';

interface RecipesViewProps {
  recipes: DetectedRecipe[];
  cartItems: ShoppingItem[];
  onOpenRecipeDetail: (recipe: DetectedRecipe) => void;
  onAddAddition: (sug: DetectedRecipe['suggestedAdditions'][0]) => void;
  onOpenVoice: () => void;
  isHighContrast: boolean;
}

export const RecipesView: React.FC<RecipesViewProps> = ({
  recipes,
  cartItems,
  onOpenRecipeDetail,
  onAddAddition,
  onOpenVoice,
  isHighContrast,
}) => {
  return (
    <div id="recipes-view" className="space-y-4 pb-28">
      {/* Header */}
      <div className={`rounded-3xl p-5 transition-colors ${
        isHighContrast
          ? 'bg-black text-white border-2 border-white'
          : 'bg-gradient-to-br from-amber-700 to-orange-800 text-white shadow-md'
      }`}>
        <div className="flex items-center justify-between text-xs font-semibold text-amber-200">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-300" />
            AI Recipe Detection Active
          </span>
          <span className="rounded-full bg-amber-900/80 px-2.5 py-0.5 text-[11px] font-bold">
            {recipes.length} Detected
          </span>
        </div>

        <h2 className="mt-2 text-xl font-black">Recipe Ingredient Copilot</h2>
        <p className="text-xs text-amber-100/90 mt-1">
          SmartCart AI analyzes your list to infer meal plans, prioritizing key items and recommending missing staples.
        </p>
      </div>

      {/* Detected Recipe Cards */}
      <div className="space-y-4">
        {recipes.map((recipe) => {
          const missingCount = recipe.suggestedAdditions.filter(
            (s) => !cartItems.some((ci) => ci.item.toLowerCase().includes(s.item.split(' ')[0].toLowerCase()))
          ).length;

          return (
            <div
              key={recipe.id}
              className={`rounded-3xl border p-5 transition-colors ${
                isHighContrast
                  ? 'bg-black text-white border-white'
                  : 'bg-white text-slate-900 border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                    <ChefHat className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Detected From Cart Items
                    </span>
                    <h3 className="text-lg font-black">{recipe.name}</h3>
                    <p className="text-xs text-slate-500">{recipe.tagline}</p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenRecipeDetail(recipe)}
                  className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-colors"
                >
                  <span>Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Matched Items in Cart */}
              <div className="mt-4 rounded-2xl bg-slate-50 dark:bg-slate-900 p-3.5 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Secured Ingredients in Cart:
                </span>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {recipe.matchedItems.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300"
                    >
                      <Check className="h-3.5 w-3.5" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Ingredients Quick Add */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Suggested additions ({missingCount} missing):
                  </span>
                </div>

                <div className="space-y-2">
                  {recipe.suggestedAdditions.slice(0, 3).map((sug, idx) => {
                    const alreadyIn = cartItems.some((ci) =>
                      ci.item.toLowerCase().includes(sug.item.split(' ')[0].toLowerCase())
                    );
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {sug.item}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            ${sug.est_price.toFixed(2)} • {sug.aisle}
                          </span>
                        </div>

                        {alreadyIn ? (
                          <span className="text-[11px] font-bold text-emerald-600">In Cart</span>
                        ) : (
                          <button
                            onClick={() => onAddAddition(sug)}
                            className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs active:scale-95"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Voice Recipe Search CTA */}
      <button
        onClick={onOpenVoice}
        className="w-full rounded-2xl border border-dashed border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-4 text-center text-xs font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-50 transition-colors"
      >
        <span>Looking to cook something else? Tap to ask SmartCart AI for any recipe ingredients!</span>
      </button>
    </div>
  );
};
