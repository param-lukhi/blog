'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  Upload,
  Star,
  Layers,
  Sparkles,
  TrendingDown,
  Store,
  CheckCircle,
} from 'lucide-react';
import MediaPickerModal from './MediaPickerModal';
import PriceComparisonManager from './PriceComparisonManager';
import { StorePriceItem } from '@/components/PriceComparisonTable';
import { slugify, safeJsonParse } from '@/lib/utils';
import { AdminProductItem } from './ProductTable';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: AdminProductItem | null;
  categories: { id: string; name: string }[];
  onSaved: () => void;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  product,
  categories,
  onSaved,
}: ProductFormModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'prices' | 'images' | 'specs' | 'ratings'>('general');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Core Form State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [amazonUrl, setAmazonUrl] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('PUBLISHED');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isDeal, setIsDeal] = useState(false);

  // Images State
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // Multi-Store Prices State
  const [storePrices, setStorePrices] = useState<StorePriceItem[]>([]);

  // Specs & Features State
  const [specsList, setSpecsList] = useState<{ key: string; value: string }[]>([
    { key: 'Warranty', value: '1 Year Brand Warranty' },
    { key: 'Connectivity', value: 'Bluetooth 5.3 / USB-C' },
  ]);
  const [featuresList, setFeaturesList] = useState<string[]>([
    'Premium flagship build quality',
    'Long-lasting battery life with rapid fast charging',
  ]);
  const [prosList, setProsList] = useState<string[]>([
    'Top-tier audio / display fidelity',
    'Best-in-class performance for the price',
  ]);
  const [consList, setConsList] = useState<string[]>([
    'Slightly premium price tag',
  ]);

  // Ratings State
  const [ratingsState, setRatingsState] = useState<{ label: string; score: string }[]>([
    { label: 'Performance Score', score: '9.6' },
    { label: 'Display Score', score: '9.4' },
    { label: 'Audio / Camera', score: '9.8' },
    { label: 'Battery Score', score: '9.1' },
    { label: 'Build Quality', score: '9.5' },
    { label: 'Value for Money', score: '9.2' },
  ]);

  const [priceHistoryState, setPriceHistoryState] = useState<{ date: string; price: string }[]>([
    { date: 'May 2026', price: '₹24,999' },
    { date: 'Jun 2026', price: '₹23,499' },
    { date: 'Jul 2026', price: '₹22,999' },
  ]);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setBrand(product.brand || '');
      setSlug(product.slug || '');
      setPrice(product.price || '');
      setAmazonUrl(product.amazonUrl || '');
      setAffiliateUrl(product.affiliateUrl || '');
      setCategoryId(product.categoryId || (categories[0]?.id || ''));
      setStatus(product.status || 'PUBLISHED');
      setIsFeatured(Boolean(product.isFeatured));
      setIsTrending(Boolean(product.isTrending));
      setIsDeal(Boolean(product.isDeal));

      const parsedImgs = safeJsonParse<string[]>(product.images, []);
      setImagesList(parsedImgs);

      const parsedSpecs = safeJsonParse<Record<string, any>>(product.specifications, {});
      if (parsedSpecs._ratingScores) {
        const rObj = typeof parsedSpecs._ratingScores === 'string'
          ? safeJsonParse<Record<string, number | string>>(parsedSpecs._ratingScores, {})
          : parsedSpecs._ratingScores;
        const rArr = Object.entries(rObj).map(([k, v]) => ({ label: k, score: String(v) }));
        if (rArr.length > 0) setRatingsState(rArr);
      }
      if (parsedSpecs._priceHistory) {
        const hArr = typeof parsedSpecs._priceHistory === 'string'
          ? safeJsonParse<{ date: string; price: string }[]>(parsedSpecs._priceHistory, [])
          : parsedSpecs._priceHistory;
        if (Array.isArray(hArr) && hArr.length > 0) setPriceHistoryState(hArr);
      }

      const sArr = Object.entries(parsedSpecs)
        .filter(([k]) => !k.startsWith('_'))
        .map(([k, v]) => ({ key: k, value: String(v) }));
      if (sArr.length > 0) setSpecsList(sArr);

      const pFeatures = safeJsonParse<string[]>(product.features, []);
      if (pFeatures.length > 0) setFeaturesList(pFeatures);

      const pPros = safeJsonParse<string[]>(product.pros, []);
      if (pPros.length > 0) setProsList(pPros);

      const pCons = safeJsonParse<string[]>(product.cons, []);
      if (pCons.length > 0) setConsList(pCons);

      // Fetch existing product prices if editing
      if (product.id) {
        fetch(`/api/products/${product.id}/prices`)
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) {
              setStorePrices(data);
            }
          })
          .catch(() => {});
      }
    } else {
      // Reset for New Product
      setName('');
      setBrand('');
      setSlug('');
      setPrice('₹24,999');
      setAmazonUrl('');
      setAffiliateUrl('');
      setCategoryId(categories[0]?.id || '');
      setStatus('PUBLISHED');
      setIsFeatured(false);
      setIsTrending(false);
      setIsDeal(false);
      setImagesList(['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80']);
      setStorePrices([]);
    }
  }, [product, categories, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!product) {
      setSlug(slugify(val));
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingImage(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/media', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setImagesList((prev) => [...prev, data.url]);
        }
      } else {
        alert('Failed to upload image. Make sure file is under 5MB.');
      }
    } catch {
      alert('Error uploading image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Prepare specs with hidden ratings and history
    const specObj: Record<string, any> = {};
    specsList.forEach((s) => {
      if (s.key.trim() && !s.key.startsWith('_')) {
        specObj[s.key.trim()] = s.value.trim();
      }
    });

    const ratingsObj: Record<string, number> = {};
    ratingsState.forEach((r) => {
      if (r.label.trim()) {
        ratingsObj[r.label.trim()] = parseFloat(r.score) || 9.0;
      }
    });
    specObj._ratingScores = JSON.stringify(ratingsObj);

    const historyArr = priceHistoryState.filter((h) => h.date.trim() && h.price.trim());
    if (historyArr.length > 0) {
      specObj._priceHistory = JSON.stringify(historyArr);
    }

    const payload = {
      name,
      slug: slug || slugify(name),
      brand,
      price,
      amazonUrl,
      affiliateUrl: affiliateUrl || amazonUrl,
      categoryId,
      status,
      isFeatured,
      isTrending,
      isDeal,
      images: imagesList.filter(Boolean),
      specifications: specObj,
      features: featuresList.filter(Boolean),
      pros: prosList.filter(Boolean),
      cons: consList.filter(Boolean),
    };

    try {
      let savedProductId = product?.id;
      if (product?.id) {
        const res = await fetch(`/api/products/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to update product');
        }
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to create product');
        }
        const created = await res.json();
        savedProductId = created.id;
      }

      // Save multi-store prices if we have a valid product ID
      if (savedProductId && storePrices.length > 0) {
        await fetch(`/api/products/${savedProductId}/prices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prices: storePrices }),
        });
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-4xl rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-800/50">
          <div>
            <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white">
              {product ? 'Edit Product & Multi-Store Prices' : 'Create New Product'}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Configure product details, images, ratings, and compare prices across multiple stores.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2 overflow-x-auto bg-white dark:bg-neutral-900">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'general'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            📋 General & URLs
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('prices')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'prices'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Multi-Store Comparison</span>
            {storePrices.length > 0 && (
              <span className="px-1.5 py-0.2 bg-emerald-500 text-white rounded-full text-[10px] font-extrabold">
                {storePrices.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('images')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'images'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            🖼️ Gallery & Media ({imagesList.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'specs'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            ⚡ Specs & Pros/Cons
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ratings')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'ratings'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            ⭐ Ratings & History
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-bold">
              {error}
            </div>
          )}

          {/* TAB 1: General & URLs */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Product Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-bold text-neutral-900 dark:text-white outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Sony, Apple, Samsung"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-bold text-neutral-900 dark:text-white outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono text-neutral-900 dark:text-white outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    aria-label="Product Category"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-bold text-neutral-900 dark:text-white outline-none focus:border-brand-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Base Listed Price *
                  </label>
                  <input
                    type="text"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. ₹24,999"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-bold text-neutral-900 dark:text-white outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Direct Amazon Product URL
                  </label>
                  <input
                    type="url"
                    value={amazonUrl}
                    onChange={(e) => setAmazonUrl(e.target.value)}
                    placeholder="https://www.amazon.in/dp/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Affiliate Tracking URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={affiliateUrl}
                    onChange={(e) => setAffiliateUrl(e.target.value)}
                    placeholder="https://amzn.to/... or tracking link"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Status & Badges */}
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Publishing Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    aria-label="Publishing Status"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-bold text-neutral-900 dark:text-white outline-none focus:border-brand-500"
                  >
                    <option value="PUBLISHED">Published (Live on Website)</option>
                    <option value="DRAFT">Draft (Hidden)</option>
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Featured</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTrending}
                      onChange={(e) => setIsTrending(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Trending</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDeal}
                      onChange={(e) => setIsDeal(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Hot Deal</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Multi-Store Comparison Manager */}
          {activeTab === 'prices' && (
            <div className="space-y-4">
              <PriceComparisonManager
                prices={storePrices}
                onChange={setStorePrices}
                defaultAmazonUrl={amazonUrl}
                defaultAffiliateUrl={affiliateUrl}
                defaultPrice={price}
              />
            </div>
          )}

          {/* TAB 3: Images & Media Library */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="px-4 py-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/40 dark:hover:bg-brand-900/60 dark:text-brand-300 border border-brand-300 dark:border-brand-800 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Select from Media Library</span>
                </button>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                  id="product-image-upload"
                />
                <label
                  htmlFor="product-image-upload"
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploadingImage ? 'Uploading...' : 'Upload Image File'}</span>
                </label>
              </div>

              <MediaPickerModal
                isOpen={showMediaPicker}
                onClose={() => setShowMediaPicker(false)}
                onSelect={(url) => setImagesList((prev) => [...prev, url])}
                title="Select Product Image"
              />

              {/* Direct URL Input */}
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Or paste external image URL..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs outline-none focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (imageUrlInput.trim()) {
                      setImagesList((prev) => [...prev, imageUrlInput.trim()]);
                      setImageUrlInput('');
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold"
                >
                  Add URL
                </button>
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {imagesList.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-neutral-100 dark:bg-neutral-800 aspect-square flex items-center justify-center p-2"
                  >
                    <img
                      src={imgUrl}
                      alt={`Product Image ${idx + 1}`}
                      className="max-h-full max-w-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setImagesList(imagesList.filter((_, i) => i !== idx))}
                        className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                        title="Delete Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-brand-600 text-white font-extrabold text-[9px] uppercase">
                        Main Image
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Specs & Pros/Cons */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              {/* Specs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Key Technical Specifications
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSpecsList([...specsList, { key: '', value: '' }])}
                    className="text-xs text-brand-600 font-bold flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3 h-3" /> Add Spec
                  </button>
                </div>
                <div className="space-y-2">
                  {specsList.map((s, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Spec Name (e.g. Battery Life)"
                        value={s.key}
                        onChange={(e) => {
                          const copy = [...specsList];
                          copy[idx].key = e.target.value;
                          setSpecsList(copy);
                        }}
                        className="w-1/3 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Spec Value (e.g. 30 Hours with ANC)"
                        value={s.value}
                        onChange={(e) => {
                          const copy = [...specsList];
                          copy[idx].value = e.target.value;
                          setSpecsList(copy);
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setSpecsList(specsList.filter((_, i) => i !== idx))}
                        className="p-1.5 text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Pros (Advantages)</h3>
                    <button
                      type="button"
                      onClick={() => setProsList([...prosList, ''])}
                      className="text-xs text-emerald-600 font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Pro
                    </button>
                  </div>
                  {prosList.map((p, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={p}
                        onChange={(e) => {
                          const copy = [...prosList];
                          copy[idx] = e.target.value;
                          setProsList(copy);
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setProsList(prosList.filter((_, i) => i !== idx))}
                        className="p-1 text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-rose-700 dark:text-rose-400">Cons (Drawbacks)</h3>
                    <button
                      type="button"
                      onClick={() => setConsList([...consList, ''])}
                      className="text-xs text-rose-600 font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Con
                    </button>
                  </div>
                  {consList.map((c, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={c}
                        onChange={(e) => {
                          const copy = [...consList];
                          copy[idx] = e.target.value;
                          setConsList(copy);
                        }}
                        className="flex-1 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setConsList(consList.filter((_, i) => i !== idx))}
                        className="p-1 text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Ratings & History */}
          {activeTab === 'ratings' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Performance Scores (0.0 to 10.0)
                </h3>
                {ratingsState.map((r, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={r.label}
                      onChange={(e) => {
                        const copy = [...ratingsState];
                        copy[idx].label = e.target.value;
                        setRatingsState(copy);
                      }}
                      className="w-1/2 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-bold"
                    />
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={r.score}
                      onChange={(e) => {
                        const copy = [...ratingsState];
                        copy[idx].score = e.target.value;
                        setRatingsState(copy);
                      }}
                      className="w-24 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-bold"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Bar */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Product...' : 'Save Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
