'use client';

import React, { useEffect, useState, useMemo } from 'react';
import CategoryFilters from '@/components/admin/CategoryFilters';
import CategoryCardGrid, { AdminCategoryItem } from '@/components/admin/CategoryCardGrid';
import CategoryTable from '@/components/admin/CategoryTable';
import CategoryFormModal from '@/components/admin/CategoryFormModal';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & View State
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'main' | 'sub'>('all');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc' | 'products' | 'blogs' | 'subcategories'>('name_asc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategoryItem | null>(null);
  const [initialParentId, setInitialParentId] = useState<string>('');

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to load category catalog');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Error loading categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filtered & Sorted categories
  const filteredCategories = useMemo(() => {
    let result = categories.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(search.toLowerCase()));

      const matchesType =
        filterType === 'all' ||
        (filterType === 'main' && !c.parentId) ||
        (filterType === 'sub' && !!c.parentId);

      return matchesSearch && matchesType;
    });

    result.sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      if (sortBy === 'products') return (b._count?.products || 0) - (a._count?.products || 0);
      if (sortBy === 'blogs') return (b._count?.blogs || 0) - (a._count?.blogs || 0);
      if (sortBy === 'subcategories') return (b.subcategories?.length || 0) - (a.subcategories?.length || 0);
      return 0;
    });

    return result;
  }, [categories, search, filterType, sortBy]);

  const mainCategories = useMemo(() => {
    return categories.filter((c) => !c.parentId);
  }, [categories]);

  const handleAddNew = () => {
    setEditingCategory(null);
    setInitialParentId('');
    setShowModal(true);
  };

  const handleAddSubcategory = (parentId: string) => {
    setEditingCategory(null);
    setInitialParentId(parentId);
    setShowModal(true);
  };

  const handleEdit = (category: AdminCategoryItem) => {
    setEditingCategory(category);
    setInitialParentId('');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? Linked products and blogs will be unassigned.')) {
      return;
    }

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCategories();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete category');
      }
    } catch {
      alert('Error connecting to server to delete category');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            Category & Subcategory Hierarchy
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Organize products and blog reviews with categories, emojis, and nested subcategories.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchCategories}
          disabled={loading}
          className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors self-start sm:self-auto"
          title="Refresh categories"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters Bar */}
      <CategoryFilters
        search={search}
        onSearchChange={setSearch}
        filterType={filterType}
        onFilterTypeChange={setFilterType}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={filteredCategories.length}
        onAddNew={handleAddNew}
      />

      {/* Category Views */}
      {loading ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center text-xs font-bold text-neutral-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-brand-600" />
          <span>Loading categories...</span>
        </div>
      ) : viewMode === 'cards' ? (
        <CategoryCardGrid
          categories={filteredCategories}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddSubcategory={handleAddSubcategory}
        />
      ) : (
        <CategoryTable
          categories={filteredCategories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modular Category Form Modal */}
      <CategoryFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        category={editingCategory}
        mainCategories={mainCategories}
        initialParentId={initialParentId}
        onSaved={fetchCategories}
      />
    </div>
  );
}
