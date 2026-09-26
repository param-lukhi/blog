'use client';

import React from 'react';
import Link from 'next/link';
import {
  FolderTree,
  Edit3,
  Trash2,
  ExternalLink,
  ShoppingBag,
  FileText,
  Layers,
} from 'lucide-react';
import { AdminCategoryItem } from './CategoryCardGrid';

interface CategoryTableProps {
  categories: AdminCategoryItem[];
  onEdit: (cat: AdminCategoryItem) => void;
  onDelete: (id: string) => void;
}

export default function CategoryTable({ categories, onEdit, onDelete }: CategoryTableProps) {
  if (categories.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center">
        <FolderTree className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
        <h3 className="text-base font-extrabold text-neutral-800 dark:text-neutral-200">No categories found</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Try adjusting your search criteria or create a new category.
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
              <th className="px-5 py-3.5">Category</th>
              <th className="px-4 py-3.5">Type</th>
              <th className="px-4 py-3.5">Products</th>
              <th className="px-4 py-3.5">Blogs</th>
              <th className="px-4 py-3.5">Subcategories</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {categories.map((cat) => {
              const productCount = cat._count?.products || 0;
              const blogCount = cat._count?.blogs || 0;
              const subCount = cat.subcategories?.length || cat._count?.subcategories || 0;

              return (
                <tr
                  key={cat.id}
                  className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl shrink-0">{cat.icon || '📁'}</span>
                      <div>
                        <div className="font-extrabold text-neutral-900 dark:text-white">
                          {cat.name}
                        </div>
                        <div className="text-[11px] font-mono text-neutral-400">
                          /{cat.slug}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {cat.parent ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-[10px] border border-blue-200 dark:border-blue-800">
                        Sub of {cat.parent.name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold text-[10px] border border-brand-200 dark:border-brand-800">
                        Main Category
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-4 font-bold text-neutral-800 dark:text-neutral-200">
                    {productCount}
                  </td>

                  <td className="px-4 py-4 font-bold text-neutral-800 dark:text-neutral-200">
                    {blogCount}
                  </td>

                  <td className="px-4 py-4 font-bold text-neutral-800 dark:text-neutral-200">
                    {subCount}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/category/${cat.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
                        title="View Live Category"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => onEdit(cat)}
                        className="p-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:hover:bg-brand-900/60 dark:text-brand-300 font-bold transition-colors"
                        title="Edit Category"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(cat.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-400 transition-colors"
                        title="Delete Category"
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
