import React from 'react';
import { ShoppingCart, Compass, Mic, ChefHat, CreditCard } from 'lucide-react';
import { ActiveTab } from '../types';

interface ThumbZoneNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenVoice: () => void;
  cartItemCount: number;
  hasUncheckedItems: boolean;
  recipesCount: number;
  isHighContrast: boolean;
}

export const ThumbZoneNav: React.FC<ThumbZoneNavProps> = ({
  activeTab,
  onTabChange,
  onOpenVoice,
  cartItemCount,
  recipesCount,
  isHighContrast,
}) => {
  return (
    <nav
      id="bottom-thumb-navigation"
      aria-label="Bottom Thumb Navigation"
      className={`fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md border-t transition-colors ${
        isHighContrast
          ? 'bg-black border-white text-white'
          : 'bg-white/95 backdrop-blur-md border-slate-200/90 text-slate-700 shadow-2xl'
      }`}
    >
      <div className="flex h-18 items-center justify-between px-2">
        {/* Cart Tab */}
        <button
          id="nav-cart-tab"
          onClick={() => onTabChange('cart')}
          className={`relative flex flex-1 flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            activeTab === 'cart'
              ? isHighContrast
                ? 'text-yellow-400 font-black'
                : 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <ShoppingCart className={`h-5 w-5 ${activeTab === 'cart' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {cartItemCount > 0 && (
              <span
                id="cart-badge-count"
                className={`absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[10px] font-bold ${
                  isHighContrast ? 'bg-yellow-400 text-black font-black' : 'bg-emerald-600 text-white'
                }`}
              >
                {cartItemCount}
              </span>
            )}
          </div>
          <span className="mt-1 text-[10px] tracking-tight">Cart</span>
        </button>

        {/* Suggested Store Layout & Floor Plan Tab */}
        <button
          id="nav-layout-tab"
          onClick={() => onTabChange('layout')}
          className={`flex flex-1 flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            activeTab === 'layout'
              ? isHighContrast
                ? 'text-yellow-400 font-black'
                : 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Compass className={`h-5 w-5 ${activeTab === 'layout' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="mt-1 text-[10px] tracking-tight">Layout</span>
        </button>

        {/* Center Prominent Voice Mic Trigger */}
        <div className="flex items-center justify-center px-1">
          <button
            id="thumb-voice-assistant-btn"
            onClick={onOpenVoice}
            className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform active:scale-90 ${
              isHighContrast
                ? 'bg-yellow-400 text-black border-2 border-white'
                : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/25'
            }`}
            aria-label="SmartCart Voice AI Assistant"
            title="Ask SmartCart AI"
          >
            <Mic className="h-6 w-6 animate-pulse" />
          </button>
        </div>

        {/* Recipes & Meal Detection Tab */}
        <button
          id="nav-recipes-tab"
          onClick={() => onTabChange('recipes')}
          className={`relative flex flex-1 flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            activeTab === 'recipes'
              ? isHighContrast
                ? 'text-yellow-400 font-black'
                : 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <ChefHat className={`h-5 w-5 ${activeTab === 'recipes' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {recipesCount > 0 && (
              <span className={`absolute -right-2 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold ${
                isHighContrast ? 'bg-yellow-400 text-black' : 'bg-amber-500 text-white'
              }`}>
                {recipesCount}
              </span>
            )}
          </div>
          <span className="mt-1 text-[10px] tracking-tight">Recipes</span>
        </button>

        {/* Express Self-Checkout Tab */}
        <button
          id="nav-checkout-tab"
          onClick={() => onTabChange('checkout')}
          className={`flex flex-1 flex-col items-center justify-center py-1 transition-all active:scale-95 ${
            activeTab === 'checkout'
              ? isHighContrast
                ? 'text-yellow-400 font-black'
                : 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className={`h-5 w-5 ${activeTab === 'checkout' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="mt-1 text-[10px] tracking-tight">Checkout</span>
        </button>
      </div>
    </nav>
  );
};
