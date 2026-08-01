'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import RegionalPrice from '@/components/RegionalPrice';
import AmazonButton from '@/components/AmazonButton';
import { ArrowRight, Check, X, Sparkles, Scale, Trophy } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: string;
  images: string;
  amazonUrl: string;
  affiliateUrl?: string;
  marketplaces?: string;
  specifications: string;
  pros: string;
  cons: string;
}

export default function ComparisonsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [p1Id, setP1Id] = useState<string>('');
  const [p2Id, setP2Id] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          setP1Id(data[0].id);
          if (data.length > 1) setP2Id(data[1].id);
          else setP2Id(data[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const p1 = products.find((p) => p.id === p1Id);
  const p2 = products.find((p) => p.id === p2Id);

  const parseJson = (str: string | undefined, fallback: any = []) => {
    if (!str) return fallback;
    try {
      return JSON.parse(str);
    } catch (e) {
      return fallback;
    }
  };

  const p1Specs = parseJson(p1?.specifications, {});
  const p2Specs = parseJson(p2?.specifications, {});
  const p1Pros = parseJson(p1?.pros, []);
  const p2Pros = parseJson(p2?.pros, []);
  const p1Cons = parseJson(p1?.cons, []);
  const p2Cons = parseJson(p2?.cons, []);

  const allSpecKeys = Array.from(
    new Set([...Object.keys(p1Specs), ...Object.keys(p2Specs)])
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-extrabold uppercase tracking-wide">
            <Scale className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Head-to-Head Comparisons
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Compare Tech Products Side-by-Side
          </h1>
          <p className="text-base text-neutral-600 dark:text-neutral-400">
            Compare specs, prices, pros, cons, and performance scores to find the absolute best device for your budget.
          </p>
        </div>

        {/* Product Selectors */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <label className="block text-xs font-extrabold text-neutral-400 uppercase tracking-wider mb-2">
              Select Device 1
            </label>
            <select
              value={p1Id}
              onChange={(e) => setP1Id(e.target.value)}
              className="w-full p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold text-sm outline-none border border-neutral-200 dark:border-neutral-700 focus:border-brand-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.price})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-neutral-400 uppercase tracking-wider mb-2">
              Select Device 2
            </label>
            <select
              value={p2Id}
              onChange={(e) => setP2Id(e.target.value)}
              className="w-full p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold text-sm outline-none border border-neutral-200 dark:border-neutral-700 focus:border-brand-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.price})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Table */}
        {p1 && p2 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden divide-y divide-neutral-200 dark:divide-neutral-800">
            
            {/* Header row with images */}
            <div className="grid grid-cols-3 p-6 bg-neutral-50/50 dark:bg-neutral-800/30 items-center text-center">
              <div className="text-left font-extrabold text-sm text-neutral-400 uppercase">Product Details</div>
              <div className="space-y-3 px-2">
                <div className="h-32 flex items-center justify-center">
                  <img
                    src={parseJson(p1.images, [''])[0]}
                    alt={p1.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white line-clamp-2">{p1.name}</h3>
                <RegionalPrice basePrice={p1.price} amazonUrl={p1.amazonUrl} marketplaces={p1.marketplaces} className="font-extrabold text-base" />
                <AmazonButton url={p1.affiliateUrl || p1.amazonUrl} price={p1.price} size="sm" />
              </div>
              <div className="space-y-3 px-2">
                <div className="h-32 flex items-center justify-center">
                  <img
                    src={parseJson(p2.images, [''])[0]}
                    alt={p2.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white line-clamp-2">{p2.name}</h3>
                <RegionalPrice basePrice={p2.price} amazonUrl={p2.amazonUrl} marketplaces={p2.marketplaces} className="font-extrabold text-base" />
                <AmazonButton url={p2.affiliateUrl || p2.amazonUrl} price={p2.price} size="sm" />
              </div>
            </div>

            {/* Pros */}
            <div className="grid grid-cols-3 p-6 items-start gap-4">
              <div className="font-bold text-sm text-neutral-700 dark:text-neutral-300">Key Advantages</div>
              <div className="space-y-1 text-xs">
                {p1Pros.map((pro: string, i: number) => (
                  <div key={i} className="flex items-start gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <Check className="w-4 h-4 shrink-0 mt-0.5" /> <span>{pro}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1 text-xs">
                {p2Pros.map((pro: string, i: number) => (
                  <div key={i} className="flex items-start gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    <Check className="w-4 h-4 shrink-0 mt-0.5" /> <span>{pro}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Specifications breakdown */}
            {allSpecKeys.map((key) => (
              <div key={key} className="grid grid-cols-3 p-4 items-center text-xs gap-4">
                <div className="font-bold text-neutral-500 dark:text-neutral-400">{key}</div>
                <div className="font-semibold text-neutral-900 dark:text-white">{p1Specs[key] || 'N/A'}</div>
                <div className="font-semibold text-neutral-900 dark:text-white">{p2Specs[key] || 'N/A'}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
