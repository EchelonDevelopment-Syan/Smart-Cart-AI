import React, { useState } from 'react';
import { ShoppingItem } from '../types';
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  Receipt,
  Download,
  Share2,
  Store,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Check
} from 'lucide-react';

interface CheckoutViewProps {
  items: ShoppingItem[];
  storeName: string;
  isHighContrast: boolean;
  onClearCart?: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  items,
  storeName,
  isHighContrast,
  onClearCart,
}) => {
  const [copied, setCopied] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'review' | 'paying' | 'paid'>('review');
  const [paymentMethod, setPaymentMethod] = useState<'walmart_pay' | 'card' | 'apple_pay'>('walmart_pay');

  const subtotal = items.reduce((sum, item) => sum + item.est_price * item.quantity, 0);
  const estSavings = subtotal * 0.12; // 12% SmartCart member / coupon discount
  const estTax = (subtotal - estSavings) * 0.075; // 7.5% sales tax
  const finalTotal = subtotal - estSavings + estTax;
  const checkedItemsCount = items.filter((i) => i.checked).length;
  const isAllCollected = items.length > 0 && checkedItemsCount === items.length;

  // Department / Aisle breakdown
  const categorySummary: Record<string, { count: number; sum: number }> = items.reduce(
    (acc, item) => {
      const prev = acc[item.category] || { count: 0, sum: 0 };
      acc[item.category] = {
        count: prev.count + item.quantity,
        sum: prev.sum + item.est_price * item.quantity,
      };
      return acc;
    },
    {} as Record<string, { count: number; sum: number }>
  );

  const handleCopyReceipt = () => {
    const lines = [
      `🛒 SMARTCART AI - DIGITAL RECEIPT`,
      `Store: ${storeName}`,
      `Date: ${new Date().toLocaleString()}`,
      `Order Ref: #SC-${Math.floor(100000 + Math.random() * 900000)}`,
      `----------------------------------------`,
      ...items.map((i) => `${i.quantity}x ${i.item} [${i.aisle}] - $${(i.est_price * i.quantity).toFixed(2)}`),
      `----------------------------------------`,
      `Subtotal: $${subtotal.toFixed(2)}`,
      `SmartCart Member Savings (12%): -$${estSavings.toFixed(2)}`,
      `Sales Tax (7.5%): $${estTax.toFixed(2)}`,
      `TOTAL PAID: $${finalTotal.toFixed(2)}`,
      `Status: Self-Checkout Verified & Paid`,
    ].join('\n');

    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePay = () => {
    setPaymentStep('paying');
    setTimeout(() => {
      setPaymentStep('paid');
    }, 1200);
  };

  return (
    <div id="checkout-view" className="space-y-4 pb-28">
      {/* Top Banner: Real-World Checkout Terminal */}
      <div
        className={`rounded-3xl p-5 transition-colors ${
          isHighContrast
            ? 'bg-black text-white border-2 border-white'
            : 'bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white shadow-xl'
        }`}
      >
        <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
          <span className="flex items-center gap-1.5">
            <Store className="h-4 w-4" />
            SmartCart Terminal Handoff
          </span>
          <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-mono text-emerald-300">
            {isAllCollected ? 'All Items Scanned' : `${checkedItemsCount}/${items.length} Scanned`}
          </span>
        </div>

        <h2 className="mt-2 text-xl font-black tracking-tight">Express Self-Checkout</h2>
        <p className="mt-1 text-xs text-slate-300 leading-relaxed">
          Ready for register lane bypass or Walmart Pay digital handoff at {storeName}.
        </p>

        {/* Digital Member Barcode Container for Lane Scanner */}
        <div className="mt-4 rounded-2xl bg-white p-3.5 text-slate-950 shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-[11px] font-bold text-slate-600">
            <span className="flex items-center gap-1 font-mono">
              <QrCode className="h-3.5 w-3.5 text-emerald-600" />
              SCAN AT REGISTER / SELF-CHECKOUT
            </span>
            <span className="font-mono text-[10px] text-emerald-700 font-black">
              LIVE EAN-128
            </span>
          </div>

          {/* Realistic Barcode graphic */}
          <div className="mt-3 flex flex-col items-center">
            <div className="flex h-12 w-full max-w-xs items-center justify-between px-2">
              {[4, 2, 6, 2, 8, 4, 3, 5, 2, 7, 4, 2, 6, 8, 3, 5, 2, 9, 3, 6, 2, 7, 4, 3, 5, 2, 8, 4, 2, 6, 3, 7].map(
                (w, i) => (
                  <div
                    key={i}
                    style={{ width: `${w}px` }}
                    className="h-full bg-black shrink-0"
                  />
                )
              )}
            </div>
            <span className="mt-1 font-mono text-[11px] font-bold tracking-widest text-slate-800">
              490218 558291 00482
            </span>
          </div>
        </div>

        {/* Amount Summary */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Due
            </span>
            <div className="text-2xl font-black text-white">${finalTotal.toFixed(2)}</div>
          </div>

          {paymentStep !== 'paid' ? (
            <button
              id="confirm-pay-btn"
              onClick={handlePay}
              disabled={paymentStep === 'paying' || items.length === 0}
              className="flex items-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 px-5 py-3 text-xs font-black text-slate-950 shadow-lg transition-transform disabled:opacity-50"
            >
              <CreditCard className="h-4 w-4" />
              <span>{paymentStep === 'paying' ? 'Processing...' : 'Pay with Walmart Pay'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 rounded-2xl bg-emerald-500/20 border border-emerald-400 px-3 py-2 text-xs font-bold text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Paid & Verified</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment Success Confirmation Card */}
      {paymentStep === 'paid' && (
        <div className="rounded-3xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-emerald-100 shadow-md">
          <div className="flex items-center gap-2 text-sm font-black text-emerald-300">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>Transaction Complete — Show Exit Pass</span>
          </div>
          <p className="mt-1 text-xs text-emerald-200/80">
            Your receipt has been logged. You may bypass the front customer service line.
          </p>
        </div>
      )}

      {/* Itemized Digital Receipt Card */}
      <div
        className={`rounded-3xl border p-4 transition-colors ${
          isHighContrast
            ? 'bg-black text-white border-white'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Itemized Line Items ({items.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReceipt}
              className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 active:scale-95"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Share2 className="h-3 w-3" />}
              <span>{copied ? 'Copied' : 'Share Receipt'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable list of scanned items */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto mt-2">
          {items.map((item) => (
            <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {item.checked ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                  )}
                  <span>{item.item}</span>
                  {item.isOrganic && (
                    <span className="rounded bg-emerald-100 text-emerald-800 px-1 py-0.2 text-[9px] font-bold">
                      Organic
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {item.quantity}x @ ${item.est_price.toFixed(2)} • {item.aisle}
                </div>
              </div>

              <span className="font-black text-slate-900 dark:text-white">
                ${(item.est_price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Cost Calculations */}
        <div className="mt-4 border-t border-slate-200 dark:border-slate-800 pt-3 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              SmartCart AI Coupon Match
            </span>
            <span>-${estSavings.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Estimated Sales Tax (7.5%)</span>
            <span>${estTax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2 text-sm font-black text-slate-900 dark:text-white">
            <span>Total</span>
            <span>${finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Spend by Department / Aisle */}
      <div
        className={`rounded-3xl border p-4 transition-colors ${
          isHighContrast
            ? 'bg-black text-white border-white'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
        }`}
      >
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-2">
          Department Spend Breakdown
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {(Object.entries(categorySummary) as [string, { count: number; sum: number }][]).map(([cat, val]) => (
            <div
              key={cat}
              className="rounded-2xl border border-slate-100 dark:border-slate-800 p-2.5 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                  {cat}
                </span>
                <span className="text-[10px] text-slate-400">{val.count} items</span>
              </div>
              <span className="font-black text-emerald-700 dark:text-emerald-400">
                ${val.sum.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Real-World Deployment Checklist Badge */}
      <div className="rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-3 text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-bold">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Production Store Sync Active
        </span>
        <span className="font-mono text-[10px] text-slate-400">
          Walmart Hillsborough ID #3142
        </span>
      </div>
    </div>
  );
};
