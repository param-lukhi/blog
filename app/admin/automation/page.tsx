'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap, Link as LinkIcon, Sparkles, Copy, Check, FileText,
  Share2, Tag, ShieldCheck, Instagram, Youtube, HelpCircle, Save,
  CheckCircle2, ArrowRight, ExternalLink, RefreshCw, Upload, Image as ImageIcon,
  Layers, ShoppingBag, Globe, AlertCircle, Eye, Rocket, CheckSquare
} from 'lucide-react';

interface CategoryOption {
  id: string;
  name: string;
}

export default function AdminAutomationPage() {
  // Input Mode: 'url' | 'name' | 'image'
  const [inputMode, setInputMode] = useState<'url' | 'name' | 'image'>('url');
  const [url, setUrl] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [publishImmediately, setPublishImmediately] = useState(false);

  // Categories list
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  // Generation & Status state
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'review' | 'specs' | 'guide' | 'social' | 'seo'>('review');

  // Result state
  const [resultData, setResultData] = useState<{
    blog: any;
    product: any;
    category: any;
    draft: any;
    status: string;
    socialKit: {
      instagram: string;
      youtube: string;
      pinterest: string;
      twitter: string;
    };
  } | null>(null);

  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit.');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => null);
      if (data && data.url) {
        setImageUrl(data.url);
      } else {
        // Bulletproof fallback using local FileReader
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImageUrl(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }

      // Auto-populate product name from clean filename if empty
      if (!productQuery.trim()) {
        const cleanName = file.name
          .replace(/\.[a-zA-Z0-9]+$/, '')
          .replace(/[-_]+/g, ' ')
          .trim();
        if (cleanName.length > 2 && !/^\d+$/.test(cleanName)) {
          setProductQuery(
            cleanName
              .split(' ')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ')
          );
        }
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (inputMode === 'url' && !url.trim()) {
      alert('Please enter a product or Amazon URL.');
      return;
    }
    if (inputMode === 'name' && !productQuery.trim()) {
      alert('Please enter a product name or search term.');
      return;
    }
    if (inputMode === 'image' && !imageUrl.trim() && !productQuery.trim()) {
      alert('Please upload an image or provide a product name.');
      return;
    }

    setGenerating(true);
    setResultData(null);
    setPublishSuccess(false);

    try {
      setGenerationStep('🔍 Fetching & analyzing accurate product specs & images...');
      await new Promise((r) => setTimeout(r, 600));

      setGenerationStep('🧠 AI Synthesizing complete SEO review, pros/cons & FAQs...');

      const res = await fetch('/api/automation/amazon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: inputMode === 'url' ? url.trim() : '',
          query: (inputMode === 'name' || inputMode === 'image') ? productQuery.trim() : '',
          imageUrl: inputMode === 'image' ? imageUrl.trim() : '',
          categoryId: selectedCategoryId || undefined,
          publishImmediately,
        }),
      });

      const data = await res.json();

      if (data.success && data.blog && data.draft) {
        setGenerationStep('💾 Saving Product & Blog Draft in Database...');
        await new Promise((r) => setTimeout(r, 400));

        const title = data.draft.title || 'Product';
        const brand = data.draft.brand || 'Brand';

        setResultData({
          blog: data.blog,
          product: data.product,
          category: data.category,
          draft: data.draft,
          status: data.status || 'DRAFT',
          socialKit: {
            instagram: `🔥 Hands-on Review: ${title}!\n\nIs it worth buying in 2026? We tested build quality, real-world benchmarks, and daily performance.\n\n✨ Key Highlights:\n- ${data.draft.pros?.[0] || 'Top-tier performance'}\n- ${data.draft.pros?.[1] || 'Premium build quality'}\n\n👉 Tap the link in bio to read our complete review and check best discount deals! #TechDeals #${brand} #Gadgets #TechPulse`,
            youtube: `[INTRO HOOK]\n"Hey everyone! Welcome back to TechPulse. Today we are giving you the ultimate breakdown and hands-on review of the ${title}!"\n\n[KEY HIGHLIGHTS & SPECS]\n- Benchmark Performance: Tested with heavy real-world tasks\n- Pros: ${data.draft.pros?.join(', ') || 'Great build'}\n- Cons: ${data.draft.cons?.join(', ') || 'Minor trade-offs'}\n\n[VERDICT & OUTRO]\n"Check out the link in the description for full benchmarks and live Amazon pricing in your region. Don't forget to like and subscribe!"`,
            pinterest: `📌 ${title} - Full Review, Real Benchmarks & Best Amazon Deals (2026). Everything you need to know before buying! #Tech #Deals #Gadgets`,
            twitter: `⚡ Just dropped our deep-dive review of the ${title}!\n\nHere is what you need to know:\n\n✅ ${data.draft.pros?.[0] || 'High performance'}\n✅ ${data.draft.pros?.[1] || 'Sleek design'}\n❌ ${data.draft.cons?.[0] || 'Premium price'}\n\nRead our full verdict & regional deals ⬇️`,
          },
        });
      } else {
        alert(data.error || 'Failed to generate product review');
      }
    } catch (err) {
      alert('Generation error. Please check your internet connection and try again.');
    } finally {
      setGenerating(false);
      setGenerationStep('');
    }
  };

  const handlePublishNow = async () => {
    if (!resultData?.blog?.id) return;
    setPublishing(true);
    try {
      // Publish both Blog and Product
      await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...resultData.blog,
          status: 'PUBLISHED',
        }),
      });

      // Update blog status directly
      const patchRes = await fetch(`/api/blogs/${resultData.blog.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' }),
      }).catch(() => null);

      if (resultData.product?.id) {
        await fetch(`/api/products/${resultData.product.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'PUBLISHED' }),
        }).catch(() => null);
      }

      setPublishSuccess(true);
      if (resultData) {
        setResultData({ ...resultData, status: 'PUBLISHED' });
      }
    } catch (err) {
      alert('Error updating status');
    } finally {
      setPublishing(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-amber-500 font-extrabold text-xs uppercase tracking-wider mb-1">
          <Zap className="w-4 h-4" /> Amazon & AI Automated Content Suite
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Automated Review, Product & Draft Generator
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Paste any Amazon product link, search product name, or upload an image to instantly create complete <strong>Product & Blog drafts</strong> with accurate specs, SEO content, and multi-region deals.
        </p>
      </div>

      {/* Input Mode Selector & Generator Card */}
      <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft space-y-6">
        {/* Mode Buttons */}
        <div className="flex items-center gap-2 p-1.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl w-fit flex-wrap">
          <button
            type="button"
            onClick={() => setInputMode('url')}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
              inputMode === 'url'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>1. Amazon / Store Link</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('name')}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
              inputMode === 'name'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>2. Product Name / Search</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('image')}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
              inputMode === 'image'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>3. Product Image + Title</span>
          </button>
        </div>

        {/* Generator Form */}
        <form onSubmit={handleGenerate} className="space-y-4">
          {/* Mode 1: URL Input */}
          {inputMode === 'url' && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Amazon Product URL or Store Link *
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  placeholder="https://www.amazon.com/dp/B0CHX6QG73 or https://www.amazon.in/dp/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-xs outline-none focus:border-amber-500 font-medium"
                />
                <LinkIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
              </div>
              <p className="text-[11px] text-neutral-400">
                Auto-scrapes live title, ASIN, high-resolution gallery images, pricing, and feature bullets.
              </p>
            </div>
          )}

          {/* Mode 2: Product Name Input */}
          {inputMode === 'name' && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Product Name / Model / Search Keyword *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Samsung Galaxy S24 Ultra, Sony WH-1000XM5, Apple MacBook Air M3"
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-xs outline-none focus:border-amber-500 font-medium"
                />
                <Tag className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
              </div>
              <p className="text-[11px] text-neutral-400">
                Synthesizes exact technical specs, multi-country pricing (USD & INR), and creates full buying guides.
              </p>
            </div>
          )}

          {/* Mode 3: Image Input */}
          {inputMode === 'image' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Upload Product Image File
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-amber-500 rounded-2xl cursor-pointer bg-neutral-50 dark:bg-neutral-800 transition-colors">
                    <Upload className="w-5 h-5 text-neutral-400 mb-1" />
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-200">
                      {uploadingImage ? 'Uploading Image...' : 'Click to Upload Image'}
                    </span>
                    <span className="text-[10px] text-neutral-400">PNG, JPG, WEBP up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Or Paste Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-xs outline-none focus:border-amber-500 font-medium"
                  />
                  {imageUrl && (
                    <div className="mt-2 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Attached product preview"
                        className="w-9 h-9 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-2xs"
                      />
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Image attached successfully
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Product Name / Title for this Image
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dyson V15 Detect Cordless Vacuum, Sony WH-1000XM5"
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-xs outline-none focus:border-amber-500 font-medium"
                />
              </div>
            </div>
          )}

          {/* Options Row: Category & Save Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Target Category
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-xs outline-none focus:border-amber-500 font-medium cursor-pointer"
              >
                <option value="">✨ Auto-Detect Category (Recommended)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    📂 {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Publishing mode */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Save Status
              </label>
              <div className="flex items-center gap-2 pt-1.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-700 dark:text-neutral-200 select-none">
                  <input
                    type="checkbox"
                    checked={!publishImmediately}
                    onChange={(e) => setPublishImmediately(!e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <span>Save as <strong>DRAFT</strong> (Safe mode for Admin Review)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={generating}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-neutral-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-neutral-950" />
                <span>{generationStep || 'Generating Review & Creating Drafts...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Full Review & Auto-Save Product + Blog Draft</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* SUCCESS BANNER & QUICK ACTIONS */}
      {resultData && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500 text-white shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-emerald-950 dark:text-emerald-300 flex items-center gap-2">
                  <span>Product & Blog Draft Created Successfully!</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 uppercase font-bold">
                    {resultData.status}
                  </span>
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                  Both <strong>{resultData.draft.title}</strong> and the Product entry are saved and ready in your catalog.
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <Link
                href={`/admin/blogs/${resultData.blog.id}`}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Edit in Blog Editor</span>
              </Link>

              <Link
                href="/admin/products"
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>View Products</span>
              </Link>

              {resultData.status === 'DRAFT' && !publishSuccess && (
                <button
                  type="button"
                  onClick={handlePublishNow}
                  disabled={publishing}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Rocket className="w-3.5 h-3.5" />
                  <span>{publishing ? 'Publishing...' : 'Publish to Live'}</span>
                </button>
              )}

              {publishSuccess && (
                <span className="px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Live on Site
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generated Content Output Tabs */}
      {resultData && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 shadow-soft space-y-6 animate-in fade-in duration-200">
          {/* Tabs header */}
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4 flex-wrap gap-3">
            <div className="flex gap-2 flex-wrap text-xs font-bold">
              <button
                onClick={() => setActiveTab('review')}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  activeTab === 'review'
                    ? 'bg-brand-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                1. Full Article Review
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  activeTab === 'specs'
                    ? 'bg-brand-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                2. Specs & Pros/Cons
              </button>
              <button
                onClick={() => setActiveTab('social')}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  activeTab === 'social'
                    ? 'bg-brand-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                3. Social Media Kit
              </button>
              <button
                onClick={() => setActiveTab('seo')}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  activeTab === 'seo'
                    ? 'bg-brand-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                4. SEO & Multi-Country Deals
              </button>
            </div>

            <Link
              href={`/admin/blogs/${resultData.blog.id}`}
              className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold text-xs flex items-center gap-1.5"
            >
              <span>Open in Editor</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Tab 1: Full Article Review */}
          {activeTab === 'review' && (
            <div className="space-y-6 text-xs">
              <div className="flex flex-col sm:flex-row gap-4 items-start bg-neutral-50 dark:bg-neutral-800/60 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                <img
                  src={resultData.draft.featuredImage}
                  alt={resultData.draft.title}
                  className="w-28 h-28 object-cover rounded-xl shrink-0 bg-neutral-200 dark:bg-neutral-700"
                />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-extrabold text-[10px]">
                      {resultData.draft.categoryName}
                    </span>
                    <span className="font-bold text-neutral-500">{resultData.draft.brand}</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{resultData.draft.price}</span>
                  </div>
                  <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                    {resultData.draft.title}
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-mono">
                    URL Slug: /blog/{resultData.blog.slug}
                  </p>
                </div>
              </div>

              {/* Rich Blog Body HTML Preview */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-xs text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  Generated Article Content Preview
                </h4>
                <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans prose dark:prose-invert max-w-none text-xs space-y-4 border border-neutral-100 dark:border-neutral-800">
                  <div dangerouslySetInnerHTML={{ __html: resultData.draft.content }} />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Specs & Pros/Cons */}
          {activeTab === 'specs' && (
            <div className="space-y-6 text-xs">
              {/* Specs Table */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-xs text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  Technical Specifications
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-neutral-50 dark:bg-neutral-800/60 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                  {Object.entries(resultData.draft.specifications || {}).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1.5 border-b border-neutral-200/50 dark:border-neutral-700/50">
                      <span className="font-bold text-neutral-500">{key}:</span>
                      <span className="font-semibold text-neutral-900 dark:text-white text-right ml-2">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pros and Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
                  <h5 className="font-extrabold text-emerald-800 dark:text-emerald-300">✅ Pros & Advantages</h5>
                  <ul className="space-y-1.5">
                    {resultData.draft.pros?.map((p: string, i: number) => (
                      <li key={i} className="text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                        <span>•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-2">
                  <h5 className="font-extrabold text-rose-800 dark:text-rose-300">❌ Trade-offs / Cons</h5>
                  <ul className="space-y-1.5">
                    {resultData.draft.cons?.map((c: string, i: number) => (
                      <li key={i} className="text-rose-900 dark:text-rose-200 flex items-start gap-2">
                        <span>•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* FAQs */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-xs text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  Automated FAQs
                </h4>
                <div className="space-y-2">
                  {resultData.draft.faqs?.map((f: any, i: number) => (
                    <div key={i} className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-1">
                      <div className="font-extrabold text-neutral-900 dark:text-white">Q: {f.question}</div>
                      <div className="text-neutral-600 dark:text-neutral-300">{f.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Social Media Kit */}
          {activeTab === 'social' && (
            <div className="space-y-4 text-xs">
              {/* Instagram */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-500" /> Instagram Caption
                  </h4>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(resultData.socialKit.instagram, 'insta')}
                    className="px-3 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-700 font-bold flex items-center gap-1 text-[11px] hover:bg-neutral-300"
                  >
                    {copiedKey === 'insta' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />} Copy
                  </button>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 font-mono whitespace-pre-line text-[11px] leading-relaxed">
                  {resultData.socialKit.instagram}
                </p>
              </div>

              {/* YouTube Outline */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-rose-500" /> YouTube Review Script Outline
                  </h4>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(resultData.socialKit.youtube, 'yt')}
                    className="px-3 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-700 font-bold flex items-center gap-1 text-[11px] hover:bg-neutral-300"
                  >
                    {copiedKey === 'yt' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />} Copy
                  </button>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 font-mono whitespace-pre-line text-[11px] leading-relaxed">
                  {resultData.socialKit.youtube}
                </p>
              </div>

              {/* Twitter / X */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-blue-500" /> Twitter / X Thread Post
                  </h4>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(resultData.socialKit.twitter, 'tw')}
                    className="px-3 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-700 font-bold flex items-center gap-1 text-[11px] hover:bg-neutral-300"
                  >
                    {copiedKey === 'tw' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />} Copy
                  </button>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 font-mono whitespace-pre-line text-[11px] leading-relaxed">
                  {resultData.socialKit.twitter}
                </p>
              </div>
            </div>
          )}

          {/* Tab 4: SEO & Multi-Country Deals */}
          {activeTab === 'seo' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-2">
                <div className="font-bold text-neutral-900 dark:text-white">Meta Title Tag:</div>
                <div className="font-mono text-brand-600 dark:text-brand-400 bg-white dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  {resultData.draft.metaTitle}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-2">
                <div className="font-bold text-neutral-900 dark:text-white">Meta Description Tag:</div>
                <div className="font-mono text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  {resultData.draft.metaDescription}
                </div>
              </div>

              {/* Regional Marketplace URLs */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-3">
                <h4 className="font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-500" /> Multi-Country Regional Affiliate Links
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(resultData.draft.marketplaces || {}).map(([country, mData]: [string, any]) => (
                    <div key={country} className="p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                      <span className="font-bold text-neutral-700 dark:text-neutral-300">{country}: {mData.price}</span>
                      <a
                        href={mData.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-brand-600 hover:underline flex items-center gap-1 font-bold"
                      >
                        <span>Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
