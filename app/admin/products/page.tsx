'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingBag, Plus, Edit3, Trash2, Globe, ExternalLink, Sparkles, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { MARKETPLACE_LIST, generateRegionalAffiliateUrls, MarketplaceEntry } from '@/lib/location';

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: string;
  amazonUrl: string;
  affiliateUrl: string;
  marketplaces?: string | null;
  isFeatured: boolean;
  isTrending: boolean;
  isDeal: boolean;
  status: string;
  categoryId: string;
  category?: { name: string };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [amazonUrl, setAmazonUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isDeal, setIsDeal] = useState(false);

  // Marketplace Prices & Links State (key = country code, value = { price, url, available })
  const [marketplacesData, setMarketplacesData] = useState<Record<string, MarketplaceEntry>>({});
  const [activeMarketplaceTab, setActiveMarketplaceTab] = useState<string>('IN');

  const fetchProducts = () => {
    setLoading(true);
    setError(null);
    fetch('/api/products?status=ALL')
      .then((res) => {
        if (!res.ok) throw new Error('Unable to load products from database');
        return res.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Unable to load data.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          if (data.length > 0) setCategoryId(data[0].id);
        }
      });
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setBrand('');
    setPrice('$999.00');
    setAmazonUrl('');
    setIsFeatured(false);
    setIsTrending(false);
    setIsDeal(false);
    
    // Initialize default marketplaces
    const initial: Record<string, MarketplaceEntry> = {};
    MARKETPLACE_LIST.forEach((m) => {
      initial[m.code] = { price: '', url: '', available: true };
    });
    setMarketplacesData(initial);
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setBrand(product.brand);
    setPrice(product.price);
    setAmazonUrl(product.amazonUrl);
    setCategoryId(product.categoryId);
    setIsFeatured(product.isFeatured);
    setIsTrending(product.isTrending);
    setIsDeal(product.isDeal);

    let parsed: Record<string, MarketplaceEntry> = {};
    if (product.marketplaces) {
      try {
        parsed = JSON.parse(product.marketplaces);
      } catch (e) {}
    }

    const merged: Record<string, MarketplaceEntry> = {};
    MARKETPLACE_LIST.forEach((m) => {
      merged[m.code] = parsed[m.code] || { price: '', url: '', available: true };
    });
    setMarketplacesData(merged);
    setShowModal(true);
  };

  const handleAutoGenerateMarketplaces = () => {
    if (!amazonUrl) {
      alert('Please enter an Amazon Product URL first');
      return;
    }
    const generated = generateRegionalAffiliateUrls(amazonUrl);
    setMarketplacesData((prev) => {
      const next = { ...prev };
      Object.keys(generated).forEach((code) => {
        next[code] = {
          ...next[code],
          url: generated[code].url,
          price: next[code]?.price || (code === 'US' ? price : ''),
        };
      });
      return next;
    });
  };

  const handleMarketplaceChange = (code: string, field: keyof MarketplaceEntry, value: any) => {
    setMarketplacesData((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        [field]: value,
      },
    }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const cleanedMarketplaces: Record<string, MarketplaceEntry> = {};
    Object.keys(marketplacesData).forEach((code) => {
      const entry = marketplacesData[code];
      if (entry && (entry.price || entry.url)) {
        cleanedMarketplaces[code] = entry;
      }
    });

    const payload = {
      name,
      slug,
      brand,
      price,
      amazonUrl,
      affiliateUrl: amazonUrl.includes('tag=') ? amazonUrl : `${amazonUrl}?tag=techpulse-20`,
      marketplaces: JSON.stringify(cleanedMarketplaces),
      categoryId,
      images: JSON.stringify(['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80']),
      isFeatured,
      isTrending,
      isDeal,
      status: 'PUBLISHED',
    };

    let res;
    if (editingProduct) {
      res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    if (res.ok) {
      setShowModal(false);
      fetchProducts();
    } else {
      alert('Failed to save product data.');
    }
  };

  const handleDelete = async (id: string, productName: string) => {
    if (!confirm(`Delete product "${productName}"?`)) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };

  const handleToggleStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchProducts();
  };

  const getMarketplacesCount = (product: Product) => {
    if (!product.marketplaces) return 0;
    try {
      const parsed = JSON.parse(product.marketplaces);
      return Object.keys(parsed).filter((k) => parsed[k]?.price || parsed[k]?.url).length;
    } catch (e) {
      return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">Global Product Management</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Manage prices, Amazon affiliate URLs, and availability for all 20 supported Amazon operating countries.</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 max-w-3xl w-full my-8 space-y-6 shadow-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div>
                <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white">
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
                </h2>
                <p className="text-xs text-neutral-500">Configure core product details & 20-country Amazon marketplace pricing.</p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-neutral-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6 text-xs font-bold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sony WH-1000XM5 Headphones"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Sony"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Default Base Price *</label>
                  <input
                    type="text"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. $348.00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 dark:text-neutral-300 mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 outline-none focus:border-brand-500 bg-white dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-neutral-700 dark:text-neutral-300">Primary Amazon URL *</label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateMarketplaces}
                    className="text-[11px] text-brand-600 dark:text-brand-400 font-extrabold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Auto-generate 20 Amazon Store Links</span>
                  </button>
                </div>
                <input
                  type="url"
                  required
                  value={amazonUrl}
                  onChange={(e) => setAmazonUrl(e.target.value)}
                  placeholder="https://www.amazon.com/dp/B08N5WRWNW"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 outline-none focus:border-brand-500"
                />
              </div>

              {/* 20 Amazon Marketplace Data Manager */}
              <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-700 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700 pb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span className="font-extrabold text-neutral-900 dark:text-white text-sm">
                      Marketplace Pricing & Affiliate Links (All 20 Countries)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-thin">
                  {MARKETPLACE_LIST.map((m) => {
                    const hasData = Boolean(marketplacesData[m.code]?.price || marketplacesData[m.code]?.url);
                    const isActive = activeMarketplaceTab === m.code;
                    return (
                      <button
                        key={m.code}
                        type="button"
                        onClick={() => setActiveMarketplaceTab(m.code)}
                        className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-all ${
                          isActive
                            ? 'bg-brand-600 text-white font-extrabold shadow-xs'
                            : hasData
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 font-bold border border-emerald-300'
                            : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
                        }`}
                      >
                        <span>{m.flag}</span>
                        <span>{m.code}</span>
                      </button>
                    );
                  })}
                </div>

                {(() => {
                  const m = MARKETPLACE_LIST.find((x) => x.code === activeMarketplaceTab) || MARKETPLACE_LIST[0];
                  const currentData = marketplacesData[m.code] || { price: '', url: '', available: true };
                  return (
                    <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-700 space-y-3">
                      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-700 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{m.flag}</span>
                          <div>
                            <div className="font-extrabold text-neutral-900 dark:text-white text-xs">
                              {m.name} ({m.domain})
                            </div>
                          </div>
                        </div>

                        <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer text-emerald-600">
                          <input
                            type="checkbox"
                            checked={currentData.available !== false}
                            onChange={(e) => handleMarketplaceChange(m.code, 'available', e.target.checked)}
                            className="rounded"
                          />
                          <span>Available in Store</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-neutral-700 dark:text-neutral-300 mb-1">
                            Exact Store Price ({m.currency} {m.symbol})
                          </label>
                          <input
                            type="text"
                            value={currentData.price || ''}
                            onChange={(e) => handleMarketplaceChange(m.code, 'price', e.target.value)}
                            placeholder={`e.g. ${m.symbol}999.00`}
                            className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 outline-none focus:border-brand-500 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-neutral-700 dark:text-neutral-300 mb-1">
                            Affiliate URL for {m.domain}
                          </label>
                          <input
                            type="url"
                            value={currentData.url || ''}
                            onChange={(e) => handleMarketplaceChange(m.code, 'url', e.target.value)}
                            placeholder={`https://www.${m.domain}/dp/...`}
                            className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 outline-none focus:border-brand-500 font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-sm"
                >
                  {editingProduct ? 'Save Product Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 space-y-4 animate-pulse">
          <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded-xl w-48" />
          <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-xl w-full" />
          <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-xl w-full" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-8 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-3xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="font-extrabold text-rose-900 dark:text-rose-200 text-sm">Unable to load data.</h3>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
          </button>
        </div>
      )}

      {/* Products Table / Empty State */}
      {!loading && !error && (
        products.length > 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 font-bold text-neutral-500 uppercase tracking-wider">
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Brand</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Default Price</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Active Marketplaces</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {products.map((p) => {
                    const activeCount = getMarketplacesCount(p);
                    return (
                      <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                        <td className="p-4 font-bold text-neutral-900 dark:text-white max-w-xs truncate">
                          <a href={`/product/${p.slug}`} target="_blank" className="hover:text-brand-600">
                            {p.name}
                          </a>
                        </td>
                        <td className="p-4 text-neutral-600 dark:text-neutral-400 font-medium">{p.brand}</td>
                        <td className="p-4 text-neutral-600 dark:text-neutral-400">{p.category?.name}</td>
                        <td className="p-4 font-extrabold text-neutral-900 dark:text-white">{p.price}</td>
                        <td className="p-4">
                          <select
                            value={p.status || 'PUBLISHED'}
                            onChange={(e) => handleToggleStatus(p.id, e.target.value)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase border outline-none ${
                              p.status === 'PUBLISHED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                                : p.status === 'DRAFT'
                                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-neutral-100 text-neutral-700 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300'
                            }`}
                          >
                            <option value="PUBLISHED">Published</option>
                            <option value="DRAFT">Draft</option>
                            <option value="HIDDEN">Hidden</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                            activeCount > 0 ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
                          }`}>
                            <Globe className="w-3 h-3 text-emerald-600" />
                            <span>{activeCount} / 20 Stores</span>
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 hover:bg-brand-100 flex items-center gap-1 font-bold px-2.5"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
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
          /* PROFESSIONAL EMPTY STATE */
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center space-y-4 shadow-soft">
            <ShoppingBag className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto" />
            <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">No products found.</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              You haven't added any products to the database yet. Click below to add your first product.
            </p>
            <button
              onClick={openAddModal}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Product</span>
            </button>
          </div>
        )
      )}
    </div>
  );
}
