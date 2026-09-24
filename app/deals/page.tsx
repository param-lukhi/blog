import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import AffiliateDisclosureNotice from '@/components/AffiliateDisclosureNotice';
import { Flame, ArrowRight, Sparkles } from 'lucide-react';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Today\'s Best Tech Deals & Amazon Price Drops - TechPulse',
  description: 'Handpicked Amazon tech deals, price drops, and verified discounts on smartphones, laptops, and audio gear.',
  alternates: {
    canonical: '/deals',
  },
};

export default async function DealsPage() {
  const deals = await db.product.findMany({
    where: { status: 'PUBLISHED', isDeal: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="pb-16 pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-md shadow-amber-500/20">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Today&apos;s Tech Deals &amp; Discounts
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm mt-0.5">
              Handpicked price reductions and notable promotion deals across Amazon marketplaces.
            </p>
          </div>
        </div>

        <span className="px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 font-bold text-xs self-start sm:self-auto">
          {deals.length} Active Deals
        </span>
      </div>

      {/* Affiliate Notice */}
      <AffiliateDisclosureNotice compact />

      {/* Deals Grid */}
      {deals.length === 0 ? (
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-3xl p-12 text-center border border-neutral-200 dark:border-neutral-800 space-y-3">
          <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
            No active deals listed at this moment.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            <span>Explore All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {deals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
