'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash, ExternalLink, RefreshCw, Tag, DollarSign, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { StorePriceItem } from '@/components/PriceComparisonTable';

const PRESET_STORES = [
  { name: 'Amazon India', slug: 'amazon' },
  { name: 'Flipkart', slug: 'flipkart' },
  { name: 'Croma Electronics', slug: 'croma' },
  { name: 'Reliance Digital', slug: 'reliance' },
  { name: 'Official Brand Store', slug: 'brand-store' },
  { name: 'Tata CLiQ', slug: 'tatacliq' },
];

interface PriceComparisonManagerProps {
  prices: StorePriceItem[];
  onChange: (prices: StorePriceItem[]) => void;
  defaultAmazonUrl?: string;
  defaultAffiliateUrl?: string;
  defaultPrice?: string;
}

export default function PriceComparisonManager({
  prices = [],
  onChange,
  defaultAmazonUrl = '',
  defaultAffiliateUrl = '',
  defaultPrice = '',
}: PriceComparisonManagerProps) {
  const [activeStoreSlug, setActiveStoreSlug] = useState('amazon');

  // If empty, initialize default Amazon row if available
  useEffect(() => {
    if (prices.length === 0 && (defaultAmazonUrl || defaultPrice)) {
      const numPrice = defaultPrice ? parseFloat(defaultPrice.replace(/[^0-9.]/g, '')) : null;
      onChange([
        {
          storeName: 'Amazon India',
          storeSlug: 'amazon',
          price: numPrice,
          originalPrice: numPrice ? Math.round(numPrice * 1.15) : null,
          currency: 'INR',
          discount: 15,
          inStock: true,
          productUrl: defaultAmazonUrl,
          affiliateUrl: defaultAffiliateUrl || defaultAmazonUrl,
          offerText: 'Standard Amazon merchant warranty and prime delivery.',
          lastCheckedAt: new Date().toISOString(),
        },
      ]);
    }
  }, [defaultAmazonUrl, defaultPrice]);

  const handleAddStore = (preset?: { name: string; slug: string }) => {
    const targetStore = preset || PRESET_STORES.find((s) => s.slug === activeStoreSlug) || PRESET_STORES[0];
    if (prices.some((p) => p.storeSlug === targetStore.slug)) {
      alert(`Store "${targetStore.name}" is already in the comparison table.`);
      return;
    }

    const newRow: StorePriceItem = {
      storeName: targetStore.name,
      storeSlug: targetStore.slug,
      price: null,
      originalPrice: null,
      currency: 'INR',
      discount: null,
      inStock: true,
      productUrl: '',
      affiliateUrl: '',
      offerText: '',
      lastCheckedAt: new Date().toISOString(),
    };

    onChange([...prices, newRow]);
  };

  const handleUpdateField = (index: number, field: keyof StorePriceItem, value: any) => {
    const copy = [...prices];
    copy[index] = { ...copy[index], [field]: value };

    // Auto-calculate discount if price and original price are present
    if (field === 'price' || field === 'originalPrice') {
      const p = field === 'price' ? parseFloat(value) : copy[index].price;
      const op = field === 'originalPrice' ? parseFloat(value) : copy[index].originalPrice;
      if (p && op && op > p) {
        copy[index].discount = Math.round(((op - p) / op) * 100);
      }
    }

    onChange(copy);
  };

  const handleRemoveStore = (index: number) => {
    onChange(prices.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 p-6 rounded-3xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-200 dark:border-emerald-900/60">
        <div>
          <h3 className="font-extrabold text-emerald-950 dark:text-emerald-300 text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Multi-Store Comparison Matrix (Amazon vs Flipkart vs Croma)</span>
          </h3>
          <p className="text-xs text-emerald-900/70 dark:text-emerald-400/70 mt-0.5">
            Add verified prices and store affiliate links to display the live comparison table on product pages.
          </p>
        </div>

        {/* Quick Add Preset Store Button */}
        <div className="flex items-center gap-2">
          <select
            value={activeStoreSlug}
            onChange={(e) => setActiveStoreSlug(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-800 dark:text-white outline-none"
          >
            {PRESET_STORES.map((s) => (
              <option key={s.slug} value={s.slug}>
                + Add {s.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => handleAddStore()}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Store</span>
          </button>
        </div>
      </div>

      {/* Store Rows List */}
      {prices.length === 0 ? (
        <div className="text-center py-8 bg-white/70 dark:bg-neutral-900/50 rounded-2xl border border-dashed border-emerald-200 dark:border-emerald-800 space-y-3">
          <p className="text-xs text-neutral-500">No stores added to comparison table yet.</p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {PRESET_STORES.slice(0, 3).map((s) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => handleAddStore(s)}
                className="px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 text-xs font-bold"
              >
                + Add {s.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {prices.map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 dark:border-neutral-800 shadow-xs space-y-4"
            >
              {/* Row Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-extrabold text-sm flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={item.storeName}
                    onChange={(e) => handleUpdateField(idx, 'storeName', e.target.value)}
                    placeholder="Store Name (e.g. Amazon India)"
                    className="font-bold text-sm text-neutral-900 dark:text-white bg-transparent border-b border-transparent focus:border-emerald-500 outline-none px-1"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.inStock !== false}
                      onChange={(e) => handleUpdateField(idx, 'inStock', e.target.checked)}
                      className="accent-emerald-600 rounded"
                    />
                    <span className={item.inStock !== false ? 'text-emerald-600 font-bold' : 'text-rose-500'}>
                      {item.inStock !== false ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleRemoveStore(idx)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
                    title="Remove Store"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Price & Discount Fields */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Live Price (₹ / $) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={item.price ?? ''}
                    onChange={(e) => handleUpdateField(idx, 'price', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g. 24999"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-extrabold text-neutral-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    MRP / Original Price
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={item.originalPrice ?? ''}
                    onChange={(e) => handleUpdateField(idx, 'originalPrice', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g. 29999"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Discount % (Auto)
                  </label>
                  <input
                    type="number"
                    value={item.discount ?? ''}
                    onChange={(e) => handleUpdateField(idx, 'discount', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="e.g. 17"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-bold text-rose-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    value={item.couponCode ?? ''}
                    onChange={(e) => handleUpdateField(idx, 'couponCode', e.target.value)}
                    placeholder="e.g. SAVE1000"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono outline-none"
                  />
                </div>
              </div>

              {/* URLs & Offers Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Store Product URL
                  </label>
                  <input
                    type="url"
                    value={item.productUrl ?? ''}
                    onChange={(e) => handleUpdateField(idx, 'productUrl', e.target.value)}
                    placeholder="https://www.store.com/product..."
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                    Tagged Affiliate URL *
                  </label>
                  <input
                    type="url"
                    value={item.affiliateUrl ?? ''}
                    onChange={(e) => handleUpdateField(idx, 'affiliateUrl', e.target.value)}
                    placeholder="https://amzn.to/... or https://affiliate.store..."
                    className="w-full px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-neutral-800 text-xs font-mono text-emerald-700 dark:text-emerald-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                  Bank Offers / Deal Details
                </label>
                <input
                  type="text"
                  value={item.offerText ?? ''}
                  onChange={(e) => handleUpdateField(idx, 'offerText', e.target.value)}
                  placeholder="e.g. Extra ₹2,000 off on HDFC/ICICI Credit Cards + Free 1-Day Delivery"
                  className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
