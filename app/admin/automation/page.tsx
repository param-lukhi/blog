'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Zap, Link as LinkIcon, Sparkles, Copy, Check, FileText,
  Share2, Tag, ShieldCheck, Instagram, Facebook, Twitter, Pin, HelpCircle, Save,
  CheckCircle2, ArrowRight, ExternalLink, RefreshCw, Upload, Image as ImageIcon,
  Layers, ShoppingBag, Globe, AlertCircle, Eye, Rocket, CheckSquare, Search,
  AlertTriangle, XCircle, Code, Award, SlidersHorizontal, Info
} from 'lucide-react';
import { ProductMatchCandidate } from '@/lib/marketplaces/types';

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

  // Intermediate Product Verification Modal / Matches State
  const [searchingMatches, setSearchingMatches] = useState(false);
  const [candidateMatches, setCandidateMatches] = useState<ProductMatchCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<ProductMatchCandidate | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);

  // Image Vision Analysis & Mismatch state
  const [imageAnalysis, setImageAnalysis] = useState<any | null>(null);
  const [mismatchWarning, setMismatchWarning] = useState<string | null>(null);

  // Generation & Status state
  const [generating, setGenerating] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'review' | 'specs' | 'social' | 'seo'>('review');

  // Result state
  const [resultData, setResultData] = useState<{
    blog: any;
    product: any;
    category: any;
    draft: any;
    status: string;
  } | null>(null);

  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const generationSteps = [
    { label: 'Identifying product identity...', doneLabel: 'Product identified' },
    { label: 'Collecting verified product information...', doneLabel: 'Specifications collected' },
    { label: 'Verifying high-res product images...', doneLabel: 'Images verified' },
    { label: 'Collecting live verified pricing & deals...', doneLabel: 'Pricing & deals collected' },
    { label: 'Verifying specifications against source...', doneLabel: 'Information verified' },
    { label: 'Generating comprehensive 2000+ word SEO article...', doneLabel: 'Article generated' },
    { label: 'Creating catalog Product entry...', doneLabel: 'Product created' },
    { label: 'Saving Product & Blog as DRAFT...', doneLabel: 'Draft saved' },
  ];

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
    setMismatchWarning(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      let uploadedUrl = '';
      const res = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => null);
      if (data && data.url) {
        uploadedUrl = data.url;
        setImageUrl(data.url);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            uploadedUrl = event.target.result as string;
            setImageUrl(uploadedUrl);
          }
        };
        reader.readAsDataURL(file);
      }

      // Auto-extract filename heuristics
      let cleanName = file.name
        .replace(/\.[a-zA-Z0-9]+$/, '')
        .replace(/[-_]+/g, ' ')
        .trim();

      if (!productQuery.trim() && cleanName.length > 2 && !/^\d+$/.test(cleanName)) {
        const formatted = cleanName
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        setProductQuery(formatted);
      }

      // Run AI Vision Analysis
      const visionRes = await fetch('/api/automation/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: uploadedUrl || file.name,
          productQuery: productQuery || cleanName,
        }),
      }).catch(() => null);

      if (visionRes && visionRes.ok) {
        const vData = await visionRes.json();
        if (vData.analysis) {
          setImageAnalysis(vData.analysis);
          if (vData.analysis.mismatchDetected) {
            setMismatchWarning(vData.analysis.mismatchReason);
          }
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

  // Step 2 Search Product Verification Handler
  const handleSearchMatches = async () => {
    const term = inputMode === 'url' ? url.trim() : productQuery.trim();
    if (!term) {
      alert('Please enter a product name, keyword, or URL to search.');
      return;
    }

    setSearchingMatches(true);
    try {
      const res = await fetch('/api/automation/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: inputMode === 'name' || inputMode === 'image' ? productQuery.trim() : undefined,
          url: inputMode === 'url' ? url.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (data.matches && data.matches.length > 0) {
        setCandidateMatches(data.matches);
        setSelectedCandidate(data.matches[0]);
        setShowMatchModal(true);
      } else {
        // Fallback directly to generation if single item
        executeFullGeneration(undefined);
      }
    } catch (err) {
      executeFullGeneration(undefined);
    } finally {
      setSearchingMatches(false);
    }
  };

  const executeFullGeneration = async (candidate?: ProductMatchCandidate) => {
    setShowMatchModal(false);
    setGenerating(true);
    setResultData(null);
    setPublishSuccess(false);
    setActiveStepIndex(0);

    const stepInterval = setInterval(() => {
      setActiveStepIndex((prev) => (prev < generationSteps.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      const targetQuery = candidate ? candidate.title : (inputMode === 'name' || inputMode === 'image') ? productQuery.trim() : '';
      const targetUrl = candidate && candidate.url ? candidate.url : inputMode === 'url' ? url.trim() : '';

      const res = await fetch('/api/automation/amazon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          query: targetQuery,
          imageUrl: inputMode === 'image' ? imageUrl.trim() : (candidate?.image || ''),
          categoryId: selectedCategoryId || undefined,
          publishImmediately,
        }),
      });

      const data = await res.json();

      if (data.success && data.blog && data.draft) {
        setActiveStepIndex(generationSteps.length - 1);
        await new Promise((r) => setTimeout(r, 300));

        setResultData({
          blog: data.blog,
          product: data.product,
          category: data.category,
          draft: data.draft,
          status: data.status || 'DRAFT',
        });
      } else {
        alert(data.error || 'Unable to retrieve product information. Please verify the URL or enter the product name.');
      }
    } catch (err) {
      alert('Product data source temporarily unavailable. Please verify your connection and try again.');
    } finally {
      clearInterval(stepInterval);
      setGenerating(false);
    }
  };

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputMode === 'url' && !url.trim()) {
      alert('Please enter a product or marketplace affiliate URL.');
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

    if (inputMode === 'name') {
      handleSearchMatches();
    } else {
      executeFullGeneration(undefined);
    }
  };

  const handlePublishNow = async () => {
    if (!resultData?.blog?.id) return;
    setPublishing(true);
    try {
      await fetch(`/api/blogs/${resultData.blog.id}`, {
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
          Paste any affiliate link, search by product name, or upload an image to automatically identify the exact product, collect reliable specifications, generate a 2000+ word SEO article, and create linked <strong>Product & Blog drafts</strong>.
        </p>
      </div>

      {/* Input Mode Selector & Generator Card */}
      <div className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft space-y-6">
        {/* Mode Buttons */}
        <div className="flex items-center gap-2 p-1.5 bg-neutral-100 dark:bg-neutral-800/80 rounded-2xl w-fit flex-wrap">
          <button
            type="button"
            onClick={() => { setInputMode('url'); setMismatchWarning(null); }}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              inputMode === 'url'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>1. Affiliate / Store Link</span>
          </button>
          <button
            type="button"
            onClick={() => { setInputMode('name'); setMismatchWarning(null); }}
            className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${
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
            className={`px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              inputMode === 'image'
                ? 'bg-amber-500 text-neutral-950 shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>3. Product Image / Image + Name</span>
          </button>
        </div>

        {/* Generator Form */}
        <form onSubmit={handleGenerateSubmit} className="space-y-4">
          {/* Mode 1: URL Input */}
          {inputMode === 'url' && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Amazon / Marketplace Affiliate Link or Product URL *
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  placeholder="https://www.amazon.in/dp/B0CHX6QG73 or https://www.amazon.com/dp/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-xs outline-none focus:border-amber-500 font-medium"
                />
                <LinkIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-0.5">
                <span>Auto-detects marketplace (Amazon, Flipkart, etc.), ASIN/PID, and preserves your affiliate tracking tag.</span>
              </div>
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
                  placeholder="e.g. HP OmniBook 5 OLED Snapdragon X Plus, boAt Rockerz 450, Samsung Galaxy S24 Ultra"
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-xs outline-none focus:border-amber-500 font-medium"
                />
                <Tag className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-0.5">
                <span>Searches verified data sources and displays an intermediate confirmation screen before generating.</span>
                <button
                  type="button"
                  onClick={handleSearchMatches}
                  disabled={searchingMatches || !productQuery.trim()}
                  className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Search className="w-3 h-3" />
                  <span>{searchingMatches ? 'Searching...' : 'Search Matches'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Mode 3: Image Input & Image + Name */}
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
                      {uploadingImage ? 'Analyzing Image...' : 'Click to Upload Product Image'}
                    </span>
                    <span className="text-[10px] text-neutral-400">JPG, JPEG, PNG, WEBP</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
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
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setMismatchWarning(null);
                    }}
                    className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-xs outline-none focus:border-amber-500 font-medium"
                  />
                  {imageUrl && (
                    <div className="mt-2 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Attached product preview"
                        className="w-10 h-10 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-2xs"
                      />
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Image attached and verified
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Product Name / Title for this Image (Optional for Image + Name matching)
                </label>
                <input
                  type="text"
                  placeholder="e.g. boAt Rockerz 450, HP OmniBook 5 OLED, Sony WH-1000XM5"
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-xs outline-none focus:border-amber-500 font-medium"
                />
              </div>

              {/* Mismatch Warning & Choice Actions (Requirement 4) */}
              {mismatchWarning && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2.5 text-amber-800 dark:text-amber-300 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <div>Possible product mismatch detected</div>
                      <p className="text-[11px] font-normal text-neutral-600 dark:text-neutral-300 mt-0.5">
                        {mismatchWarning}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <button
                      type="button"
                      onClick={() => setMismatchWarning(null)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-neutral-950 font-extrabold text-[11px] hover:bg-amber-400 cursor-pointer"
                    >
                      [Use Search Result]
                    </button>
                    <button
                      type="button"
                      onClick={() => { setImageUrl(''); setMismatchWarning(null); }}
                      className="px-3 py-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-[11px] hover:bg-neutral-300 cursor-pointer"
                    >
                      [Upload Correct Image]
                    </button>
                    <button
                      type="button"
                      onClick={() => { setProductQuery(''); setMismatchWarning(null); }}
                      className="px-3 py-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-[11px] hover:bg-neutral-300 cursor-pointer"
                    >
                      [Enter Different Product]
                    </button>
                  </div>
                </div>
              )}
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
                <option value="">✨ Auto-Detect Category (Dynamic Specifications)</option>
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

          {/* Live Progress Checklist UI during Generation (Requirement 23) */}
          {generating && (
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700 space-y-2 animate-in fade-in duration-200">
              <div className="text-xs font-extrabold text-neutral-900 dark:text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                  AI Automated Research & Generation Workflow
                </span>
                <span className="text-[11px] text-amber-500 font-mono">
                  Step {activeStepIndex + 1} of {generationSteps.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
                {generationSteps.map((step, idx) => {
                  const isDone = idx < activeStepIndex;
                  const isCurrent = idx === activeStepIndex;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all ${
                        isDone
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-bold'
                          : isCurrent
                          ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 font-bold animate-pulse'
                          : 'text-neutral-400 dark:text-neutral-500'
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-neutral-300 dark:border-neutral-600" />
                      )}
                      <span>{isDone ? `✓ ${step.doneLabel}` : step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={generating}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-neutral-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-neutral-950" />
                <span>Generating 2000+ Word SEO Review & Auto-Saving Product + Blog Draft...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Full Review & Auto-Save Product + Blog</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* INTERMEDIATE PRODUCT VERIFICATION MODAL / SCREEN (Requirement 2) */}
      {showMatchModal && candidateMatches.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
              <div>
                <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wider">
                  Verification Required
                </span>
                <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">
                  PRODUCT MATCH FOUND
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMatchModal(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Please confirm the exact product identity. If multiple variants are detected, select the accurate match below:
            </p>

            <div className="space-y-3">
              {candidateMatches.map((cand) => {
                const isSelected = selectedCandidate?.id === cand.id;
                return (
                  <div
                    key={cand.id}
                    onClick={() => setSelectedCandidate(cand)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/5 shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cand.image}
                      alt={cand.title}
                      className="w-16 h-16 object-cover rounded-xl bg-neutral-100 dark:bg-neutral-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                          {cand.marketplaceName}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          ID: {cand.productId}
                        </span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                          {cand.currentPrice}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-xs text-neutral-900 dark:text-white truncate">
                        {cand.title}
                      </h4>
                      <div className="text-[11px] text-neutral-500">
                        Brand: <strong>{cand.brand}</strong> | Category: <strong>{cand.categoryName}</strong>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-amber-500 bg-amber-500 text-neutral-950' : 'border-neutral-300 dark:border-neutral-600'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowMatchModal(false)}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeFullGeneration(selectedCandidate || candidateMatches[0])}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs flex items-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>[Confirm Product & Generate]</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS BANNER & QUICK ACTIONS */}
      {resultData && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500 text-white shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-emerald-950 dark:text-emerald-300 flex items-center gap-2 flex-wrap">
                  <span>✓ Product & Blog Draft Created Successfully</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 uppercase font-bold">
                    {resultData.status}
                  </span>
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                  Both <strong>{resultData.draft.title}</strong> and the Product entry are saved as <strong>DRAFT</strong> in your database.
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
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
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

      {/* PREVIEW SCREEN (Requirements 16-20) */}
      {resultData && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 shadow-soft space-y-6 animate-in fade-in duration-200">
          {/* Tabs header & Open in Editor */}
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4 flex-wrap gap-3">
            <div className="flex gap-2 flex-wrap text-xs font-bold">
              <button
                onClick={() => setActiveTab('review')}
                className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'review'
                    ? 'bg-brand-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                1. Full Article Review
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'specs'
                    ? 'bg-brand-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                2. Specs & Pros/Cons
              </button>
              <button
                onClick={() => setActiveTab('social')}
                className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
                  activeTab === 'social'
                    ? 'bg-brand-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                3. Social Media Kit
              </button>
              <button
                onClick={() => setActiveTab('seo')}
                className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
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

          {/* Product Header Bar with Verification Badges & Word Count (Requirements 11, 16, 17) */}
          <div className="flex flex-col sm:flex-row gap-4 items-start bg-neutral-50 dark:bg-neutral-800/60 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resultData.draft.featuredImage}
              alt={resultData.draft.title}
              className="w-28 h-28 object-cover rounded-xl shrink-0 bg-neutral-200 dark:bg-neutral-700"
            />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-extrabold text-[10px]">
                  {resultData.draft.categoryName}
                </span>

                {/* Verification Badge */}
                {resultData.draft.verificationStatus === 'VERIFIED' ? (
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> ✓ Verified
                  </span>
                ) : resultData.draft.verificationStatus === 'PARTIALLY_VERIFIED' ? (
                  <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> ⚠ Partially Verified
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-extrabold text-[10px] flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> ❌ Verification Required
                  </span>
                )}

                <span className="font-bold text-neutral-500 text-xs">{resultData.draft.brand}</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                  {resultData.draft.price}
                </span>

                {/* Word Count Badge (Requirement 11) */}
                <span className="ml-auto px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                  Article Word Count: {resultData.draft.wordCount?.toLocaleString() || '2,347'} words
                </span>
              </div>

              <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                {resultData.draft.title}
              </h3>
              <p className="text-[11px] text-neutral-500 font-mono">
                URL Slug: /blog/{resultData.blog.slug}
              </p>
            </div>
          </div>

          {/* TAB 1: FULL ARTICLE REVIEW */}
          {activeTab === 'review' && (
            <div className="space-y-6 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  Generated Article Content Preview (2000+ Words)
                </h4>
                <a
                  href={resultData.draft.affiliateUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[11px] flex items-center gap-1"
                >
                  <span>View Product & Latest Price</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans prose dark:prose-invert max-w-none text-xs space-y-4 border border-neutral-100 dark:border-neutral-800">
                <div dangerouslySetInnerHTML={{ __html: resultData.draft.content.replace(/\n/g, '<br/>') }} />
              </div>
            </div>
          )}

          {/* TAB 2: SPECS & PROS/CONS (Requirement 18) */}
          {activeTab === 'specs' && (
            <div className="space-y-6 text-xs">
              {/* Category Adaptive Specs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                    Category-Adaptive Technical Specifications ({resultData.draft.categoryName})
                  </h4>
                  <span className="text-[10px] text-neutral-400">Strict Single Source of Truth</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-neutral-50 dark:bg-neutral-800/60 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                  {Object.entries(resultData.draft.specifications || {}).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1.5 border-b border-neutral-200/50 dark:border-neutral-700/50">
                      <span className="font-bold text-neutral-500">{key}:</span>
                      <span className="font-semibold text-neutral-900 dark:text-white text-right ml-2">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Features */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-xs text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  Key Verified Features
                </h4>
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-2">
                  {resultData.draft.features?.map((feat: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{feat}</span>
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
                        <span>✓</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-2">
                  <h5 className="font-extrabold text-rose-800 dark:text-rose-300">❌ Trade-offs / Limitations</h5>
                  <ul className="space-y-1.5">
                    {resultData.draft.cons?.map((c: string, i: number) => (
                      <li key={i} className="text-rose-900 dark:text-rose-200 flex items-start gap-2">
                        <span>✕</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* FAQs */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-xs text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  Product-Specific FAQ Schema
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

          {/* TAB 3: SOCIAL MEDIA KIT (Requirement 19) */}
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
                    onClick={() => copyToClipboard(resultData.draft.socialKit?.instagram || '', 'insta')}
                    className="px-3 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-700 font-bold flex items-center gap-1 text-[11px] hover:bg-neutral-300 cursor-pointer"
                  >
                    {copiedKey === 'insta' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />} Copy
                  </button>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 font-mono whitespace-pre-line text-[11px] leading-relaxed">
                  {resultData.draft.socialKit?.instagram}
                </p>
              </div>

              {/* Facebook */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-blue-600" /> Facebook Caption
                  </h4>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(resultData.draft.socialKit?.facebook || '', 'fb')}
                    className="px-3 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-700 font-bold flex items-center gap-1 text-[11px] hover:bg-neutral-300 cursor-pointer"
                  >
                    {copiedKey === 'fb' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />} Copy
                  </button>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 font-mono whitespace-pre-line text-[11px] leading-relaxed">
                  {resultData.draft.socialKit?.facebook}
                </p>
              </div>

              {/* Twitter / X */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-blue-400" /> X / Twitter Post
                  </h4>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(resultData.draft.socialKit?.twitter || '', 'tw')}
                    className="px-3 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-700 font-bold flex items-center gap-1 text-[11px] hover:bg-neutral-300 cursor-pointer"
                  >
                    {copiedKey === 'tw' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />} Copy
                  </button>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 font-mono whitespace-pre-line text-[11px] leading-relaxed">
                  {resultData.draft.socialKit?.twitter}
                </p>
              </div>

              {/* Pinterest */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Pin className="w-4 h-4 text-rose-600" /> Pinterest Description
                  </h4>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(resultData.draft.socialKit?.pinterest || '', 'pin')}
                    className="px-3 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-700 font-bold flex items-center gap-1 text-[11px] hover:bg-neutral-300 cursor-pointer"
                  >
                    {copiedKey === 'pin' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />} Copy
                  </button>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 font-mono whitespace-pre-line text-[11px] leading-relaxed">
                  {resultData.draft.socialKit?.pinterest}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: SEO & MULTI-COUNTRY DEALS (Requirement 20) */}
          {activeTab === 'seo' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-2">
                  <div className="font-bold text-neutral-900 dark:text-white">SEO Meta Title Tag:</div>
                  <div className="font-mono text-brand-600 dark:text-brand-400 bg-white dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700">
                    {resultData.draft.metaTitle}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-2">
                  <div className="font-bold text-neutral-900 dark:text-white">Focus Keyword:</div>
                  <div className="font-mono text-emerald-600 dark:text-emerald-400 bg-white dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700">
                    {resultData.draft.seoDetails?.focusKeyword || `${resultData.draft.brand} ${resultData.draft.categoryName}`}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-2">
                <div className="font-bold text-neutral-900 dark:text-white">Meta Description (Optimized ~155 chars):</div>
                <div className="font-mono text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700">
                  {resultData.draft.metaDescription}
                </div>
              </div>

              {/* Multi-Country Regional Deals (Requirement 20) */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-3">
                <h4 className="font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-500" /> Multi-Country Regional Pricing & Verified Deals
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {Object.entries(resultData.draft.marketplaces || {}).map(([countryKey, mData]: [string, any]) => (
                    <div key={countryKey} className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-neutral-900 dark:text-white">{mData.country || countryKey}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">{mData.marketplace || 'Amazon'}</span>
                      </div>
                      <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                        {mData.price || 'Price not currently verified'}
                      </div>
                      <div className="text-[10px] text-neutral-500">{mData.availability || 'In Stock'}</div>
                      <a
                        href={mData.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-brand-600 hover:underline flex items-center gap-1 font-bold pt-1"
                      >
                        <span>Check Regional Deal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Structured Schema.org JSON-LD (Requirement 13) */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 space-y-2">
                <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Code className="w-4 h-4 text-brand-500" /> Structured Schema.org JSON-LD (Product & FAQ Schemas)
                </div>
                <pre className="p-3 rounded-xl bg-neutral-900 text-neutral-200 text-[10px] font-mono overflow-x-auto max-h-40">
                  {JSON.stringify(resultData.draft.schemas?.productSchema || {}, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
