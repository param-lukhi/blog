'use client';

import React from 'react';
import Link from 'next/link';
import {
  Edit3,
  Trash2,
  ExternalLink,
  ShoppingBag,
  Star,
  TrendingUp,
  Tag,
  CheckCircle,
  XCircle,
  Store,
} from 'lucide-react';
import { safeJsonParse } from '@/lib/utils';

export interface AdminProductItem {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: string;
  images: string;
  amazonUrl: string;
  affiliateUrl: string;
  specifications?: string;
  features?: string;
  pros?: string;
  cons?: string;
  marketplaces?: string | null;
  isFeatured: boolean;
  isTrending: boolean;
  isDeal: boolean;
  status: string;
  categoryId: string;
  category?: { name: string };
  prices?: { id: string; storeName: string; price: number | null }[];
}

interface ProductTableProps {
  products: AdminProductItem[];
  onEdit: (product: AdminProductItem) => void;
  onDelete: (id: string) => void;
}

export default function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center">
        <ShoppingBag className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
        <h3 className="text-base font-extrabold text-neutral-800 dark:text-neutral-200">No products found</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
          Try adjusting your search filters or click "Add Product" above to create a new product entry.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-extrabold text-[10px] border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              <th className="px-5 py-3.5">Product</th>
              <th className="px-4 py-3.5">Category & Brand</th>
              <th className="px-4 py-3.5">Base Price</th>
              <th className="px-4 py-3.5">Multi-Store Comparison</th>
              <th className="px-4 py-3.5">Badges</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {products.map((p) => {
              const images = safeJsonParse<string[]>(p.images, []);
              const thumbnail = images[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=80';
              const priceCount = p.prices?.length || 0;

              return (
                <tr
                  key={p.id}
                  className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  {/* Product Info & Thumb */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden shrink-0 flex items-center justify-center p-1">
                        <img
                          src={thumbnail}
                          alt={p.name}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=80';
                          }}
                        />
                      </div>
                      <div className="min-w-0 max-w-xs sm:max-w-sm">
                        <div className="font-extrabold text-neutral-900 dark:text-white truncate">
                          {p.name}
                        </div>
                        <div className="text-[11px] font-mono text-neutral-400 truncate">
                          /{p.slug}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category & Brand */}
                  <td className="px-4 py-4">
                    <div className="font-bold text-neutral-800 dark:text-neutral-200">
                      {p.brand || '—'}
                    </div>
                    <div className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold">
                      {p.category?.name || 'Uncategorized'}
                    </div>
                  </td>

                  {/* Base Price */}
                  <td className="px-4 py-4">
                    <div className="font-extrabold text-neutral-900 dark:text-white">
                      {p.price || '—'}
                    </div>
                  </td>

                  {/* Multi-Store Comparison */}
                  <td className="px-4 py-4">
                    {priceCount > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
                        <Store className="w-3 h-3" />
                        {priceCount} {priceCount === 1 ? 'Store' : 'Stores'} Listed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-[10px] font-medium">
                        Default Amazon Only
                      </span>
                    )}
                  </td>

                  {/* Badges */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {p.isFeatured && (
                        <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-extrabold text-[10px] border border-amber-200 dark:border-amber-800 flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Featured
                        </span>
                      )}
                      {p.isTrending && (
                        <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-extrabold text-[10px] border border-purple-200 dark:border-purple-800 flex items-center gap-0.5">
                          <TrendingUp className="w-2.5 h-2.5" /> Trending
                        </span>
                      )}
                      {p.isDeal && (
                        <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-extrabold text-[10px] border border-rose-200 dark:border-rose-800 flex items-center gap-0.5">
                          <Tag className="w-2.5 h-2.5" /> Deal
                        </span>
                      )}
                      {!p.isFeatured && !p.isTrending && !p.isDeal && (
                        <span className="text-[11px] text-neutral-400">—</span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    {p.status === 'PUBLISHED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle className="w-3 h-3" /> Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[11px] font-bold border border-amber-200 dark:border-amber-800">
                        <XCircle className="w-3 h-3" /> Draft
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/product/${p.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
                        title="View Live Product"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => onEdit(p)}
                        className="p-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:hover:bg-brand-900/60 dark:text-brand-300 font-bold transition-colors"
                        title="Edit Product & Prices"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(p.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-400 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
