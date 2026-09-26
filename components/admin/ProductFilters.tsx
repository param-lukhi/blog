'use client';

import React from 'react';
import { Search, Plus, Filter, Tag, ShoppingBag } from 'lucide-react';

interface ProductFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  categories: { id: string; name: string }[];
  totalCount: number;
  onAddNew: () => void;
}

export default function ProductFilters({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  categories,
  totalCount,
  onAddNew,
}: ProductFiltersProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Search and Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by name, brand..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-medium text-neutral-900 dark:text-white outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <div className="min-w-[160px]">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              aria-label="Filter by Category"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 outline-none focus:border-brand-500"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="min-w-[130px]">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              aria-label="Filter by Status"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 outline-none focus:border-brand-500"
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </div>

        {/* Right: Count and Add Product Button */}
        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-3 py-2 rounded-xl border border-neutral-200/60 dark:border-neutral-700">
            {totalCount} {totalCount === 1 ? 'Product' : 'Products'}
          </span>

          <button
            type="button"
            onClick={onAddNew}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>
    </div>
  );
}
