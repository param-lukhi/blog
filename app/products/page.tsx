import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import AffiliateDisclosureNotice from '@/components/AffiliateDisclosureNotice';
import AdBanner from '@/components/AdBanner';
import { Package, Sparkles, PlusCircle, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Best Tech Products, Buying Guides & Recommendations - BlogWeb904',
  description: 'Browse our complete catalog of researched tech products, smartphones, laptops, audio gear, and multi-store price comparisons.',
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { category?: string; query?: string };
}) {
  const categoryFilter = searchParams?.category;
  const searchQuery = searchParams?.query;

  const whereClause: any = { status: 'PUBLISHED' };
  if (categoryFilter) {
    whereClause.category = { slug: categoryFilter };
  }
  if (searchQuery) {
    whereClause.OR = [
      { name: { contains: searchQuery, mode: 'insensitive' } },
      { brand: { contains: searchQuery, mode: 'insensitive' } },
    ];
  }

  const products = await db.product.findMany({
    where: whereClause,
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  const categories = await db.category.findMany({
    orderBy: { name: 'asc' },
  });

  const buyingGuides = [
    { label: 'Audio & Earbuds', slug: 'earbuds', icon: '🎧' },
    { label: 'Mobiles & Flagships', slug: 'mobiles', icon: '📱' },
    { label: 'Laptops & Ultrabooks', slug: 'laptops', icon: '💻' },
    { label: 'Smartwatches', slug: 'smart-watches', icon: '⌚' },
    { label: '4K & OLED TVs', slug: 'tvs', icon: '📺' },
    { label: 'Gaming Gear', slug: 'gaming', icon: '🎮' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-[#0b0f17] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-extrabold uppercase tracking-wide">
            <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Curated Product Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Best Tech Products &amp; Buying Guides
          </h1>
          <p className="text-base text-neutral-600 dark:text-neutral-400">
            Explore our researched product directory with verified specifications, pros, cons, and current Amazon pricing.
          </p>
        </div>

        {/* Popular Buying Guide Shortcuts */}
        <div className="bg-white dark:bg-[#121826] rounded-3xl p-6 border border-neutral-200/90 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Popular Buying Guide Shortcuts</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {buyingGuides.map((guide, idx) => (
              <Link
                key={idx}
                href={`/category/${guide.slug}`}
                className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/70 dark:border-neutral-800 hover:border-blue-500 text-center space-y-1.5 transition-all group hover:scale-105 active:scale-95"
              >
                <span className="text-xl block group-hover:scale-110 transition-transform">{guide.icon}</span>
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {guide.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Link
            href="/products"
            className={`px-4 py-2 rounded-full font-bold text-xs shadow-md transition-all ${
              !categoryFilter
                ? 'bg-blue-600 text-white shadow-blue-500/20'
                : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-blue-500'
            }`}
          >
            All Products ({products.length})
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className={`px-4 py-2 rounded-full font-semibold text-xs transition-colors ${
                categoryFilter === cat.slug
                  ? 'bg-blue-600 text-white shadow-blue-500/20'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Affiliate Disclosure */}
        <AffiliateDisclosureNotice compact />

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white dark:bg-[#121826] rounded-3xl p-12 text-center border border-neutral-200/90 dark:border-neutral-800 max-w-xl mx-auto space-y-6 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center shadow-inner">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                Catalog Ready for New Products
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Demo products have been cleared cleanly. You can add your Amazon affiliate products with specs, pricing, and buyer reviews directly from the admin panel!
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/admin/products/new"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add First Product</span>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-all"
              >
                <span>Back to Home</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {/* AdSense Placeholder */}
        <AdBanner slot="products-bottom-ad" format="horizontal" />
      </div>
    </div>
  );
}
