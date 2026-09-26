'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search as SearchIcon, Filter, Scale, ExternalLink,
  Tag, CheckCircle, ArrowRight, Bookmark, X, AlertCircle
} from 'lucide-react';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: string;
  images: string;
  features: string;
  category?: { name: string; slug: string };
  prices?: Array<{ storeName: string; storeSlug: string; price: number | null }>;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'ALL';
  const initialBrand = searchParams.get('brand') || 'ALL';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    products: ProductItem[];
    blogs: any[];
    comparisons: any[];
    pagination: { page: number; total: number; totalPages: number };
    facets: {
      categories: Array<{ name: string; slug: string }>;
      brands: Array<{ name: string; slug: string }>;
      stores: Array<{ name: string; slug: string }>;
    };
  } | null>(null);

  // Selected products for comparison
  const [selectedForCompare, setSelectedForCompare] = useState<ProductItem[]>([]);
  const [compareError, setCompareError] = useState('');

  const fetchSearchResults = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedCategory && selectedCategory !== 'ALL') params.set('category', selectedCategory);
    if (selectedBrand && selectedBrand !== 'ALL') params.set('brand', selectedBrand);
    params.set('page', String(page));

    fetch(`/api/search?${params.toString()}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSearchResults();
  }, [query, selectedCategory, selectedBrand, page]);

  const toggleCompare = (product: ProductItem) => {
    setCompareError('');
    const exists = selectedForCompare.some((p) => p.id === product.id);

    if (exists) {
      setSelectedForCompare(selectedForCompare.filter((p) => p.id !== product.id));
    } else {
      if (selectedForCompare.length >= 3) {
        setCompareError('You can compare a maximum of 3 products at a time.');
        return;
      }
      // Check category compatibility
      if (selectedForCompare.length > 0) {
        const firstCategory = selectedForCompare[0].category?.slug;
        const currentCategory = product.category?.slug;
        if (firstCategory && currentCategory && firstCategory !== currentCategory) {
          setCompareError(`Warning: "${product.name}" is from a different category (${product.category?.name}) than existing selected items.`);
        }
      }
      setSelectedForCompare([...selectedForCompare, product]);
    }
  };

  const handleLaunchComparison = () => {
    if (selectedForCompare.length < 2) {
      setCompareError('Please select at least 2 products to compare.');
      return;
    }
    const slug = `${selectedForCompare[0].slug}-vs-${selectedForCompare[1].slug}`;
    router.push(`/comparisons/${slug}`);
  };

  const parseImage = (imgJson: string) => {
    try {
      const arr = JSON.parse(imgJson);
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : '/placeholder-product.png';
    } catch {
      return imgJson || '/placeholder-product.png';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Search Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Search Products, Reviews & Comparisons
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Search across our verified product database, in-depth buying guides, and head-to-head showdowns.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-3xl">
          <SearchIcon className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by product name, brand, model, specs (e.g., iPhone 15, Sony XM5, Noise Cancelling)..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-900 dark:text-white shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 shadow-soft space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold text-xs uppercase tracking-wider text-neutral-900 dark:text-white">
                <Filter className="w-4 h-4 text-brand-600" /> Filter Results
              </div>
              {(selectedCategory !== 'ALL' || selectedBrand !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('ALL');
                    setSelectedBrand('ALL');
                    setPage(1);
                  }}
                  className="text-[11px] font-bold text-brand-600 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white font-medium"
              >
                <option value="ALL">All Categories</option>
                {data?.facets?.categories?.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white font-medium"
              >
                <option value="ALL">All Brands</option>
                {data?.facets?.brands?.map((br) => (
                  <option key={br.slug} value={br.name}>
                    {br.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Stream */}
        <div className="lg:col-span-3 space-y-8">
          {/* Compare Error Warning */}
          {compareError && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>{compareError}</span>
            </div>
          )}

          {/* Products Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-neutral-900 dark:text-white">
                Products ({data?.pagination?.total ?? 0})
              </h2>
              <span className="text-xs text-neutral-400">
                Page {data?.pagination?.page ?? 1} of {data?.pagination?.totalPages ?? 1}
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-neutral-400">Searching catalog...</div>
            ) : !data?.products || data.products.length === 0 ? (
              <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center space-y-2">
                <p className="font-bold text-sm text-neutral-700 dark:text-neutral-300">
                  No products matched your search criteria.
                </p>
                <p className="text-xs text-neutral-400">Try adjusting your filters or search keywords.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {data.products.map((prod) => {
                  const isSelected = selectedForCompare.some((p) => p.id === prod.id);
                  return (
                    <div
                      key={prod.id}
                      className={`bg-white dark:bg-neutral-900 rounded-3xl border p-5 space-y-3 flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md'
                          : 'border-neutral-200/80 dark:border-neutral-800 shadow-soft'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                            {prod.brand}
                          </span>
                          {/* Compare Checkbox */}
                          <button
                            type="button"
                            onClick={() => toggleCompare(prod)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                              isSelected
                                ? 'bg-brand-600 text-white'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                            }`}
                          >
                            <Scale className="w-3 h-3" />
                            <span>{isSelected ? 'Selected' : 'Compare'}</span>
                          </button>
                        </div>

                        <div className="flex gap-3">
                          <img
                            src={parseImage(prod.images)}
                            alt={prod.name}
                            className="w-16 h-16 object-contain rounded-xl bg-neutral-50 dark:bg-neutral-800 p-1.5 flex-shrink-0"
                          />
                          <div>
                            <h3 className="font-bold text-xs text-neutral-900 dark:text-white line-clamp-2">
                              {prod.name}
                            </h3>
                            <div className="text-sm font-extrabold text-brand-600 dark:text-brand-400 mt-1">
                              {prod.price}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                        <Link
                          href={`/products/${prod.slug}`}
                          className="px-2.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white text-[11px] font-bold text-center transition-all"
                        >
                          Specs & Review
                        </Link>
                        <Link
                          href={`/products/${prod.slug}`}
                          className="px-2.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-[11px] font-bold text-center transition-all"
                        >
                          Check Price
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-bold disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs text-neutral-500 font-bold px-2">
                  {page} / {data.pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, data.pagination.totalPages))}
                  disabled={page >= data.pagination.totalPages}
                  className="px-3.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-bold disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Related Articles & Comparisons */}
          {data?.blogs && data.blogs.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
              <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
                Related Editorial Buying Guides ({data.blogs.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.blogs.map((b) => (
                  <Link
                    key={b.id}
                    href={`/blog/${b.slug}`}
                    className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-brand-500 transition-all flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-neutral-900 dark:text-white line-clamp-1">
                        {b.title}
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                        {b.metaDescription || 'Read full buying guide and verified benchmark analysis.'}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-brand-600 flex-shrink-0 ml-3" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Compare Action Bar */}
      {selectedForCompare.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-4 border border-neutral-700">
          <div className="flex items-center gap-2 text-xs font-extrabold">
            <Scale className="w-4 h-4 text-brand-400 dark:text-brand-600" />
            <span>{selectedForCompare.length} Product(s) Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLaunchComparison}
              disabled={selectedForCompare.length < 2}
              className="px-4 py-1.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold transition-all disabled:opacity-40"
            >
              Compare Now
            </button>
            <button
              type="button"
              onClick={() => setSelectedForCompare([])}
              className="p-1 rounded-full text-neutral-400 hover:text-white dark:hover:text-neutral-950"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PublicSearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-16 text-center text-xs text-neutral-400">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
