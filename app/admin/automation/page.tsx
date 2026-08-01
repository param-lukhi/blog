'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap, Link as LinkIcon, Sparkles, Copy, Check, FileText,
  Share2, Tag, ShieldCheck, Instagram, Youtube, HelpCircle, Save
} from 'lucide-react';

export default function AdminAutomationPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'review' | 'guide' | 'social' | 'seo'>('review');
  const [copied, setCopied] = useState(false);

  // Generated Content State
  const [generatedData, setGeneratedData] = useState<any>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() && !productQuery.trim()) return;

    setGenerating(true);

    try {
      const res = await fetch('/api/automation/amazon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), query: productQuery.trim() }),
      });

      const data = await res.json();
      if (data.success && data.article) {
        setGeneratedData({
          ...data.article,
          pinterestPin: `📌 Top Recommended Tech Deal: ${data.article.title}. Full benchmarks, pros/cons & best regional price drops! Check out our deep dive review. #Tech #AmazonDeals`,
          instagramCaption: `🔥 Unboxing & Hands-on Review: ${data.article.title}!\n\nIs it worth buying in 2026? We tested camera, performance, and battery life.\n\n👉 Tap link in bio for the best discount deals on Amazon! #Gadgets #Review`,
          youtubeScript: `[INTRO]\n"Hey everyone! Welcome back to TechPulse. Today we are doing a full hands-on review of ${data.article.title}!"\n\n[PROS]\n- Top-tier performance\n- Sleek build quality\n\n[OUTRO]\n"Check the link in the description for live Amazon discount prices across all countries!"`,
        });
      } else {
        alert(data.error || 'Failed to generate review content');
      }
    } catch (err) {
      alert('Generation error. Please check the URL.');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-amber-500 font-extrabold text-xs uppercase tracking-wider mb-1">
          <Zap className="w-4 h-4" /> Amazon AI Content Suite
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Automated Review & Social Media Generator
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Paste any Amazon product URL or title to instantly generate full reviews, FAQs, SEO metadata, and social captions.
        </p>
      </div>

      {/* Input Generator Form */}
      <form onSubmit={handleGenerate} className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Amazon Product URL
            </label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://www.amazon.com/dp/B0CHWSX469..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-xs outline-none focus:border-brand-500"
              />
              <LinkIcon className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Or Search Product Name
            </label>
            <input
              type="text"
              placeholder="e.g. Sony WH-1000XM5, MacBook Air M3"
              value={productQuery}
              onChange={(e) => setProductQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-xs outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={generating}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-neutral-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{generating ? 'Scraping Amazon & AI Writing Content...' : 'Generate Full Review, FAQs & Social Kit'}</span>
        </button>
      </form>

      {/* Generated Content Output Tabs */}
      {generatedData && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-8 shadow-soft space-y-6 animate-in fade-in duration-200">
          {/* Tabs header */}
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
            <div className="flex gap-2 flex-wrap text-xs font-bold">
              <button
                onClick={() => setActiveTab('review')}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  activeTab === 'review' ? 'bg-brand-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Article Review
              </button>
              <button
                onClick={() => setActiveTab('guide')}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  activeTab === 'guide' ? 'bg-brand-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Buying Guide & FAQs
              </button>
              <button
                onClick={() => setActiveTab('social')}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  activeTab === 'social' ? 'bg-brand-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Social Media Kit
              </button>
              <button
                onClick={() => setActiveTab('seo')}
                className={`px-4 py-2 rounded-xl transition-colors ${
                  activeTab === 'seo' ? 'bg-brand-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                SEO & Schema
              </button>
            </div>

            <button
              onClick={() => router.push('/admin/blogs')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Publish Draft</span>
            </button>
          </div>

          {/* Tab 1: Review */}
          {activeTab === 'review' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">{generatedData.title}</h3>
                <p className="text-neutral-500 mt-1">Slug: /blog/{generatedData.slug}</p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 leading-relaxed font-sans space-y-2">
                <div dangerouslySetInnerHTML={{ __html: generatedData.content }} />
              </div>
            </div>
          )}

          {/* Tab 2: Social Kit */}
          {activeTab === 'social' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-500" /> Instagram Caption
                </h4>
                <p className="text-neutral-700 dark:text-neutral-300 font-mono whitespace-pre-line">{generatedData.instagramCaption}</p>
                <button
                  onClick={() => copyToClipboard(generatedData.instagramCaption)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 font-bold flex items-center gap-1 text-[11px]"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />} Copy Caption
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-rose-500" /> YouTube Review Script Outline
                </h4>
                <p className="text-neutral-700 dark:text-neutral-300 font-mono whitespace-pre-line">{generatedData.youtubeScript}</p>
              </div>
            </div>
          )}

          {/* Tab 3: SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 space-y-2">
                <div className="font-bold text-neutral-900 dark:text-white">Meta Title:</div>
                <div className="font-mono text-brand-600 dark:text-brand-400">{generatedData.metaTitle}</div>
              </div>
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800 space-y-2">
                <div className="font-bold text-neutral-900 dark:text-white">Meta Description:</div>
                <div className="font-mono text-neutral-700 dark:text-neutral-300">{generatedData.metaDescription}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
