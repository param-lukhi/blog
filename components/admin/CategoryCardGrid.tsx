'use client';

import React from 'react';
import Link from 'next/link';
import {
  FolderTree,
  Edit3,
  Trash2,
  ExternalLink,
  Plus,
  ShoppingBag,
  FileText,
  CornerDownRight,
  Layers,
} from 'lucide-react';

export interface AdminCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  parentId: string | null;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  subcategories?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    _count?: {
      products: number;
      blogs: number;
    };
  }[];
  _count?: {
    products: number;
    blogs: number;
    subcategories: number;
  };
}

interface CategoryCardGridProps {
  categories: AdminCategoryItem[];
  onEdit: (cat: AdminCategoryItem) => void;
  onDelete: (id: string) => void;
  onAddSubcategory: (parentId: string) => void;
}

export default function CategoryCardGrid({
  categories,
  onEdit,
  onDelete,
  onAddSubcategory,
}: CategoryCardGridProps) {
  if (categories.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center">
        <FolderTree className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
        <h3 className="text-base font-extrabold text-neutral-800 dark:text-neutral-200">No categories found</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Try adjusting your search criteria or create a new category above.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((cat) => {
        const productCount = cat._count?.products || 0;
        const blogCount = cat._count?.blogs || 0;
        const subCount = cat.subcategories?.length || cat._count?.subcategories || 0;

        return (
          <div
            key={cat.id}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
          >
            <div>
              {/* Header: Icon, Name, Slug, Actions */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-xl shrink-0">
                    {cat.icon || '📁'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm">
                      {cat.name}
                    </h3>
                    <div className="text-[11px] font-mono text-neutral-400">
                      /{cat.slug}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Link
                    href={`/category/${cat.slug}`}
                    target="_blank"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="View public category page"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => onEdit(cat)}
                    className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
                    title="Edit Category"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(cat.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {cat.description && (
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-3 line-clamp-2">
                  {cat.description}
                </p>
              )}

              {/* Subcategories preview */}
              {cat.subcategories && cat.subcategories.length > 0 && (
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5">
                  <div className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-400">
                    Subcategories ({cat.subcategories.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories.map((sub) => (
                      <span
                        key={sub.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-medium"
                      >
                        <span>{sub.icon || '↳'}</span>
                        <span>{sub.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Stats & Add Sub button */}
            <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-bold">
                  <ShoppingBag className="w-3.5 h-3.5 text-brand-600" />
                  {productCount} Products
                </span>
                <span className="flex items-center gap-1 font-bold">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  {blogCount} Blogs
                </span>
              </div>

              {!cat.parentId && (
                <button
                  type="button"
                  onClick={() => onAddSubcategory(cat.id)}
                  className="text-[11px] font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" /> Sub
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
