import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import { Package } from 'lucide-react';

export const metadata = {
  title: 'Best Tested Products & Amazon Price Reviews - TechPulse',
  description: 'Browse all expert-tested tech products, smartphones, laptops, audio gear, and appliances.',
};

export default async function ProductsPage() {
  const products = await db.product.findMany({
    where: { status: 'PUBLISHED' },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  const categories = await db.category.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-extrabold uppercase tracking-wide">
            <Package className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Tested Product Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Best Tech Products & Recommendations
          </h1>
          <p className="text-base text-neutral-600 dark:text-neutral-400">
            Explore our complete catalog of reviewed products with live Amazon prices across 20 countries.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Link
            href="/products"
            className="px-4 py-2 rounded-full bg-brand-600 text-white font-bold text-xs shadow-sm"
          >
            All Products ({products.length})
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="px-4 py-2 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-brand-500 text-neutral-700 dark:text-neutral-300 font-semibold text-xs transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
