'use client';

import React, { useEffect, useState, useMemo } from 'react';
import ProductFilters from '@/components/admin/ProductFilters';
import ProductTable, { AdminProductItem } from '@/components/admin/ProductTable';
import ProductFormModal from '@/components/admin/ProductFormModal';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProductItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductItem | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);

      if (!prodRes.ok || !catRes.ok) {
        throw new Error('Failed to load products or categories');
      }

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      setProducts(Array.isArray(prodData) ? prodData : []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (err: any) {
      setError(err.message || 'Error loading product catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Products List
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase());

      const matchCategory =
        selectedCategory === 'ALL' || p.categoryId === selectedCategory;

      const matchStatus =
        selectedStatus === 'ALL' || p.status === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, search, selectedCategory, selectedStatus]);

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product: AdminProductItem) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? All linked store comparisons will also be deleted.')) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete product');
      }
    } catch {
      alert('Error connecting to server to delete product');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            Product Management & Comparisons
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage your product catalog, specs, ratings, and live multi-store comparison pricing.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors self-start sm:self-auto"
          title="Refresh products"
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
      <ProductFilters
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        categories={categories}
        totalCount={filteredProducts.length}
        onAddNew={handleAddNew}
      />

      {/* Products Table */}
      {loading ? (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center text-xs font-bold text-neutral-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-brand-600" />
          <span>Loading catalog...</span>
        </div>
      ) : (
        <ProductTable
          products={filteredProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modular Product Form Modal */}
      <ProductFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        product={editingProduct}
        categories={categories}
        onSaved={fetchData}
      />
    </div>
  );
}
