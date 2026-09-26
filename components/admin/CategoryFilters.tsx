'use client';

import React from 'react';
import { Search, Plus, LayoutGrid, List, ArrowUpDown } from 'lucide-react';

interface CategoryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterType: 'all' | 'main' | 'sub';
  onFilterTypeChange: (type: 'all' | 'main' | 'sub') => void;
  sortBy: 'name_asc' | 'name_desc' | 'products' | 'blogs' | 'subcategories';
  onSortByChange: (sort: 'name_asc' | 'name_desc' | 'products' | 'blogs' | 'subcategories') => void;
  viewMode: 'cards' | 'table';
  onViewModeChange: (mode: 'cards' | 'table') => void;
  totalCount: number;
  onAddNew: () => void;
}

export default function CategoryFilters({
  search,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  totalCount,
  onAddNew,
}: CategoryFiltersProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 p-4 sm:p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Search & Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search categories by name, slug..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-medium text-neutral-900 dark:text-white outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl border border-neutral-200/60 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => onFilterTypeChange('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterType === 'all'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onFilterTypeChange('main')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterType === 'main'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Main Only
            </button>
            <button
              type="button"
              onClick={() => onFilterTypeChange('sub')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterType === 'sub'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Subcategories
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="min-w-[150px]">
            <select
              value={sortBy}
              onChange={(e: any) => onSortByChange(e.target.value)}
              aria-label="Sort Categories"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-300 outline-none focus:border-brand-500"
            >
              <option value="name_asc">Name (A → Z)</option>
              <option value="name_desc">Name (Z → A)</option>
              <option value="products">Most Products</option>
              <option value="blogs">Most Blogs</option>
              <option value="subcategories">Most Subcategories</option>
            </select>
          </div>
        </div>

        {/* Right: View Mode & Add Button */}
        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl border border-neutral-200/60 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => onViewModeChange('cards')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onAddNew}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>
    </div>
  );
}
