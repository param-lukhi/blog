'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FolderTree,
  Plus,
  Edit3,
  Trash2,
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink,
  Layers,
  FolderPlus,
  CornerDownRight,
  Sparkles,
  CheckCircle2,
  X,
  FileText,
  ShoppingBag,
  HelpCircle,
} from 'lucide-react';
import { slugify } from '@/lib/utils';

interface CategoryItem {
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
  }[];
  _count?: {
    products: number;
    blogs: number;
    subcategories: number;
  };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'main' | 'sub'>('all');

  // Modal State for Create & Edit
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [image, setImage] = useState('');
  const [parentId, setParentId] = useState<string>('');

  // Delete Confirmation Modal State
  const [deleteCategory, setDeleteCategory] = useState<CategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    setError(null);
    fetch('/api/categories')
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load categories');
        return res.json();
      })
      .then((data) => {
        setCategories(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Unable to load data.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Main Categories available for selection as Parent
  const mainCategories = useMemo(() => {
    return categories.filter((c) => !c.parentId);
  }, [categories]);

  // Statistics
  const stats = useMemo(() => {
    const total = categories.length;
    const mainCount = categories.filter((c) => !c.parentId).length;
    const subCount = categories.filter((c) => !!c.parentId).length;
    const totalProducts = categories.reduce((acc, c) => acc + (c._count?.products || 0), 0);
    const totalBlogs = categories.reduce((acc, c) => acc + (c._count?.blogs || 0), 0);
    return { total, mainCount, subCount, totalProducts, totalBlogs };
  }, [categories]);

  // Open Create Modal (optionally with pre-selected parent)
  const openCreateModal = (preselectedParentId?: string) => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setIcon('');
    setImage('');
    setParentId(preselectedParentId || '');
    setFormError(null);
    setShowModal(true);
  };

  // Open Edit Modal
  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setIcon(cat.icon || '');
    setImage(cat.image || '');
    setParentId(cat.parentId || '');
    setFormError(null);
    setShowModal(true);
  };

  // Auto-slug generator on Name change when creating
  const handleNameChange = (value: string) => {
    setName(value);
    if (!editingCategory) {
      setSlug(slugify(value));
    }
  };

  // Submit Add / Edit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setFormError('Category name and slug are required.');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      icon: icon.trim() || null,
      image: image.trim() || null,
      parentId: parentId.trim() ? parentId.trim() : null,
    };

    try {
      let res: Response;
      if (editingCategory) {
        res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save category');
      }

      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      setFormError(err.message || 'Error occurred while saving category');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Category Execution
  const executeDelete = async () => {
    if (!deleteCategory) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/categories/${deleteCategory.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete category');
      }

      setDeleteCategory(null);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Error deleting category');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered Categories based on search and active tab
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      // Type Filter
      if (activeFilter === 'main' && c.parentId) return false;
      if (activeFilter === 'sub' && !c.parentId) return false;

      // Search Query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchSlug = c.slug.toLowerCase().includes(q);
      const matchParent = c.parent?.name.toLowerCase().includes(q);
      const matchDesc = c.description?.toLowerCase().includes(q);
      return matchName || matchSlug || matchParent || matchDesc;
    });
  }, [categories, activeFilter, searchQuery]);

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-extrabold text-xs uppercase tracking-wider mb-1">
            <FolderTree className="w-4 h-4" /> Taxonomy & Hierarchy
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Category Management
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Create, edit, organize main categories, and manage nested subcategories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openCreateModal()}
            className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
          <button
            onClick={() => {
              if (mainCategories.length > 0) {
                openCreateModal(mainCategories[0].id);
              } else {
                openCreateModal();
              }
            }}
            className="px-4 py-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <FolderPlus className="w-4 h-4 text-amber-400" />
            <span>Add Subcategory</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Categories</span>
          <p className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Main Categories</span>
          <p className="text-2xl font-extrabold text-brand-600 dark:text-brand-400 mt-1">{stats.mainCount}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Subcategories</span>
          <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{stats.subCount}</p>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Catalog Items</span>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {stats.totalProducts + stats.totalBlogs}
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-4 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search category, slug, or parent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/60 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-brand-500 focus:bg-white dark:focus:bg-neutral-800 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            All ({categories.length})
          </button>
          <button
            onClick={() => setActiveFilter('main')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'main'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            Main Categories ({stats.mainCount})
          </button>
          <button
            onClick={() => setActiveFilter('sub')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'sub'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            Subcategories ({stats.subCount})
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded-3xl" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-8 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-3xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="font-extrabold text-rose-900 dark:text-rose-200 text-sm">{error}</h3>
          <button
            onClick={fetchCategories}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
          </button>
        </div>
      )}

      {/* Categories Table / Hierarchy View */}
      {!loading && !error && (
        filteredCategories.length > 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 font-bold text-neutral-500 uppercase tracking-wider text-[11px]">
                    <th className="py-4 px-5">Category / Subcategory</th>
                    <th className="py-4 px-4">Level & Hierarchy</th>
                    <th className="py-4 px-4">URL Slug</th>
                    <th className="py-4 px-4">Linked Content</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  {filteredCategories.map((cat) => {
                    const isSubcategory = !!cat.parentId;
                    const subCount = cat.subcategories?.length || cat._count?.subcategories || 0;
                    const prodCount = cat._count?.products || 0;
                    const blogCount = cat._count?.blogs || 0;

                    return (
                      <tr
                        key={cat.id}
                        className={`hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors ${
                          isSubcategory ? 'bg-neutral-50/30 dark:bg-neutral-900/30' : ''
                        }`}
                      >
                        {/* Name & Icon */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            {isSubcategory ? (
                              <div className="flex items-center text-neutral-400 pl-2">
                                <CornerDownRight className="w-4 h-4 text-purple-500 mr-1.5 shrink-0" />
                                <span className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200/60 dark:border-purple-800/50 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-bold shrink-0">
                                  {cat.icon || '🏷️'}
                                </span>
                              </div>
                            ) : (
                              <span className="w-9 h-9 rounded-2xl bg-brand-50 dark:bg-brand-950/50 border border-brand-200/60 dark:border-brand-800/50 text-brand-600 dark:text-brand-400 flex items-center justify-center text-base font-bold shrink-0 shadow-xs">
                                {cat.icon || '📁'}
                              </span>
                            )}

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-neutral-900 dark:text-white text-sm">
                                  {cat.name}
                                </span>
                              </div>
                              {cat.description ? (
                                <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5 max-w-sm">
                                  {cat.description}
                                </p>
                              ) : (
                                <p className="text-[10px] text-neutral-400 italic">No description provided</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Hierarchy Level */}
                        <td className="py-4 px-4">
                          {isSubcategory ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-semibold text-[11px]">
                              <span>Sub of:</span>
                              <strong className="font-bold">{cat.parent?.name || 'Parent'}</strong>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-semibold text-[11px]">
                              <Layers className="w-3 h-3 text-brand-600" />
                              <span>Main Category</span>
                              {subCount > 0 && (
                                <span className="ml-1 px-1.5 py-0.2 bg-brand-200 dark:bg-brand-800 text-brand-800 dark:text-brand-200 rounded-md text-[10px] font-bold">
                                  {subCount} subs
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Slug */}
                        <td className="py-4 px-4">
                          <code className="text-[11px] text-neutral-600 dark:text-neutral-400 font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">
                            /category/{cat.slug}
                          </code>
                        </td>

                        {/* Linked Items Count */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                            <span className="flex items-center gap-1" title="Products">
                              <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
                              <strong className="font-bold text-neutral-800 dark:text-neutral-200">{prodCount}</strong>
                            </span>
                            <span className="flex items-center gap-1" title="Blog Reviews">
                              <FileText className="w-3.5 h-3.5 text-emerald-500" />
                              <strong className="font-bold text-neutral-800 dark:text-neutral-200">{blogCount}</strong>
                            </span>
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Quick Add Subcategory (for main categories) */}
                            {!isSubcategory && (
                              <button
                                onClick={() => openCreateModal(cat.id)}
                                title="Add Subcategory under this"
                                className="p-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/50 transition-all"
                              >
                                <FolderPlus className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* View Public Page */}
                            <Link
                              href={`/category/${cat.slug}`}
                              target="_blank"
                              title="View Public Page"
                              className="p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-all"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>

                            {/* Edit Button */}
                            <button
                              onClick={() => openEditModal(cat)}
                              title="Edit Category"
                              className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50 transition-all"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => setDeleteCategory(cat)}
                              title="Delete Category"
                              className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50 transition-all"
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
        ) : (
          /* Empty State */
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center space-y-4 shadow-soft">
            <FolderTree className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
            <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">
              {searchQuery ? 'No matching categories found.' : 'No categories found.'}
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              {searchQuery
                ? 'Try adjusting your search query or switching filters.'
                : 'Get started by creating your first category or subcategory.'}
            </p>
            <button
              onClick={() => openCreateModal()}
              className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create Category
            </button>
          </div>
        )
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400">
                  {editingCategory ? <Edit3 className="w-5 h-5" /> : <FolderPlus className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                    {editingCategory ? 'Edit Category' : parentId ? 'Add New Subcategory' : 'Add New Category'}
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    {editingCategory
                      ? 'Update category settings, hierarchy, or slug.'
                      : 'Configure the category name, icon, and hierarchy level.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error in Modal */}
            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Laptops or Gaming Laptops"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-500"
                />
              </div>

              {/* Slug & Parent Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Slug */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">URL Slug *</label>
                    <button
                      type="button"
                      onClick={() => setSlug(slugify(name))}
                      className="text-[10px] text-brand-600 hover:underline font-bold"
                    >
                      Regenerate
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. gaming-laptops"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white font-mono outline-none focus:border-brand-500"
                  />
                </div>

                {/* Parent Category Dropdown (Subcategory Selector) */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Parent Category
                  </label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-500 font-medium"
                  >
                    <option value="">None (Top-Level Main Category)</option>
                    {mainCategories
                      .filter((c) => !editingCategory || c.id !== editingCategory.id)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          📂 {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Icon / Emoji & Image Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Icon or Emoji */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Icon / Emoji
                  </label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="e.g. 💻, 📱, 🎧, ⚡, 📷"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-500"
                  />
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {['💻', '📱', '🎧', '📺', '⚡', '📷', '🎮', '⌚', '🏠', '🔊'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setIcon(em)}
                        className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-md hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short summary for category hub SEO and user guide..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 disabled:opacity-50 transition-all"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">Delete Category</h3>
                <p className="text-xs text-neutral-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Are you sure you want to delete <strong className="font-bold text-neutral-900 dark:text-white">"{deleteCategory.name}"</strong>?
            </p>

            {/* Warning if subcategories or products exist */}
            {(deleteCategory.subcategories?.length || 0) > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-800 dark:text-amber-300 text-xs space-y-1">
                <p className="font-bold">⚠️ Warning: Subcategories will be deleted</p>
                <p className="text-[11px]">
                  This main category has {deleteCategory.subcategories?.length} nested subcategories that will also be removed.
                </p>
              </div>
            )}

            {((deleteCategory._count?.products || 0) > 0 || (deleteCategory._count?.blogs || 0) > 0) && (
              <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-neutral-700 dark:text-neutral-300 text-xs space-y-1">
                <p className="font-bold">Associated Content:</p>
                <p className="text-[11px]">
                  • {deleteCategory._count?.products || 0} Products & • {deleteCategory._count?.blogs || 0} Blog Articles
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCategory(null)}
                className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={executeDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 disabled:opacity-50 transition-all"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
