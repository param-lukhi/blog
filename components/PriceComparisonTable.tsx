'use client';

import React from 'react';
import { ExternalLink, CheckCircle2, XCircle, Tag, TrendingDown, Clock, ShieldCheck } from 'lucide-react';

export interface StorePriceItem {
  id?: string;
  storeName: string;
  storeSlug: string;
  price: number | null;
  originalPrice?: number | null;
  currency?: string;
  discount?: number | null;
  inStock?: boolean;
  couponCode?: string | null;
  offerText?: string | null;
  productUrl?: string | null;
  affiliateUrl?: string | null;
  lastCheckedAt?: string | Date;
}

interface PriceComparisonTableProps {
  productName: string;
  prices: StorePriceItem[];
  defaultCurrency?: string;
  className?: string;
}

export default function PriceComparisonTable({
  productName,
  prices = [],
  defaultCurrency = 'INR',
  className = '',
}: PriceComparisonTableProps) {
  if (!prices || prices.length === 0) {
    return null;
  }

  // Filter prices that have valid numeric values
  const validPrices = prices.filter((p) => p.price && p.price > 0);
  const lowestPriceItem = validPrices.length > 0
    ? validPrices.reduce((prev, curr) => ((curr.price || 0) < (prev.price || 0) ? curr : prev))
    : null;

  const highestPriceItem = validPrices.length > 1
    ? validPrices.reduce((prev, curr) => ((curr.price || 0) > (prev.price || 0) ? curr : prev))
    : null;

  const priceDiff = highestPriceItem && lowestPriceItem && highestPriceItem.price && lowestPriceItem.price
    ? highestPriceItem.price - lowestPriceItem.price
    : 0;

  const formatPrice = (amount: number | null | undefined, currency: string = defaultCurrency) => {
    if (!amount || amount <= 0) return 'Check Price';
    const sym = currency === 'INR' || currency === '₹' ? '₹' : currency === 'USD' || currency === '$' ? '$' : `${currency} `;
    return `${sym}${amount.toLocaleString()}`;
  };

  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return 'Today';
    try {
      const d = new Date(dateInput);
      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  const getStoreIcon = (slug: string) => {
    const s = slug.toLowerCase();
    if (s.includes('amazon')) return '🛒';
    if (s.includes('flipkart')) return '🛍️';
    if (s.includes('croma')) return '⚡';
    if (s.includes('reliance')) return '📱';
    if (s.includes('tatacliq')) return '🏷️';
    return '🏢';
  };

  return (
    <section className={`bg-white dark:bg-[#121826] rounded-3xl p-6 sm:p-8 border border-neutral-200/90 dark:border-neutral-800 shadow-sm space-y-6 ${className}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold uppercase tracking-wide">
            <TrendingDown className="w-3.5 h-3.5" /> Multi-Store Price Comparison
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white mt-1.5">
            Where to Buy &amp; Compare Deals
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Compare verified prices across major retailers for <span className="font-semibold text-neutral-700 dark:text-neutral-300">{productName}</span>.
          </p>
        </div>

        {/* Lowest Price Banner */}
        {lowestPriceItem && lowestPriceItem.price && (
          <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-3.5 rounded-2xl flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              🏷️
            </div>
            <div>
              <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                Lowest Listed Price
              </div>
              <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 leading-tight">
                {formatPrice(lowestPriceItem.price, lowestPriceItem.currency)}
                <span className="text-xs font-semibold text-neutral-500 ml-1">on {lowestPriceItem.storeName}</span>
              </div>
              {priceDiff > 0 && (
                <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                  Save up to {formatPrice(priceDiff, lowestPriceItem.currency)} across stores
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Desktop & Tablet Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 text-xs uppercase font-extrabold tracking-wider">
              <th className="py-3.5 px-4 rounded-l-xl">Retailer</th>
              <th className="py-3.5 px-4">Price</th>
              <th className="py-3.5 px-4">Discount</th>
              <th className="py-3.5 px-4">Availability</th>
              <th className="py-3.5 px-4">Offers &amp; Coupons</th>
              <th className="py-3.5 px-4 rounded-r-xl text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            {prices.map((p, idx) => {
              const isLowest = lowestPriceItem && p.storeSlug === lowestPriceItem.storeSlug && p.price === lowestPriceItem.price;
              const targetUrl = p.affiliateUrl || p.productUrl || '#';

              return (
                <tr
                  key={idx}
                  className={`hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30 transition-colors ${
                    isLowest ? 'bg-emerald-50/30 dark:bg-emerald-950/20' : ''
                  }`}
                >
                  <td className="py-4 px-4 font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                    <span className="text-xl">{getStoreIcon(p.storeSlug)}</span>
                    <div>
                      <span>{p.storeName}</span>
                      {isLowest && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                          Best Price
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-extrabold text-base text-neutral-900 dark:text-white">
                      {formatPrice(p.price, p.currency)}
                    </div>
                    {p.originalPrice && p.price && p.originalPrice > p.price && (
                      <div className="text-xs text-neutral-400 line-through">
                        {formatPrice(p.originalPrice, p.currency)}
                      </div>
                    )}
                  </td>

                  <td className="py-4 px-4">
                    {p.discount ? (
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                        <Tag className="w-3 h-3" /> {p.discount}% OFF
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-400">—</span>
                    )}
                  </td>

                  <td className="py-4 px-4">
                    {p.inStock !== false ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-500">
                        <XCircle className="w-3.5 h-3.5" /> Out of Stock
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-xs text-neutral-600 dark:text-neutral-300 max-w-[200px]">
                    {p.offerText || p.couponCode ? (
                      <div className="space-y-0.5">
                        {p.couponCode && (
                          <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-[11px] font-bold text-brand-600">
                            Code: {p.couponCode}
                          </span>
                        )}
                        {p.offerText && <p className="truncate text-neutral-500">{p.offerText}</p>}
                      </div>
                    ) : (
                      <span className="text-neutral-400 text-xs">Standard Retail</span>
                    )}
                  </td>

                  <td className="py-4 px-4 text-right">
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-xs ${
                        isLowest
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-white'
                      }`}
                    >
                      <span>Check {p.storeName.split(' ')[0]}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive Cards View (< 768px) */}
      <div className="block md:hidden space-y-3">
        {prices.map((p, idx) => {
          const isLowest = lowestPriceItem && p.storeSlug === lowestPriceItem.storeSlug && p.price === lowestPriceItem.price;
          const targetUrl = p.affiliateUrl || p.productUrl || '#';

          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-colors space-y-3 ${
                isLowest
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                  : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getStoreIcon(p.storeSlug)}</span>
                  <div>
                    <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                      {p.storeName}
                    </h4>
                    {p.inStock !== false ? (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> In Stock
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-base text-neutral-900 dark:text-white">
                    {formatPrice(p.price, p.currency)}
                  </div>
                  {p.discount ? (
                    <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded">
                      {p.discount}% OFF
                    </span>
                  ) : null}
                </div>
              </div>

              {p.offerText && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900/60 p-2 rounded-xl border border-neutral-200/60 dark:border-neutral-800">
                  🎁 {p.offerText}
                </p>
              )}

              <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className={`w-full py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                  isLowest
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-700 text-white'
                }`}
              >
                <span>Check Price on {p.storeName}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          );
        })}
      </div>

      {/* Footer Info & Last Checked */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
          <span>Direct merchant links. Verified pricing as of {formatDate(prices[0]?.lastCheckedAt)}.</span>
        </div>
        <span>*Retailer discounts and stock may change at checkout.</span>
      </div>
    </section>
  );
}
