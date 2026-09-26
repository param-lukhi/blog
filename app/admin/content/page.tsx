'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText, Eye, MousePointerClick, RefreshCw, AlertTriangle,
  CheckCircle2, Clock, Filter, Search, ExternalLink, Sparkles,
  Target, AlertCircle, ArrowUpRight, CheckSquare, Edit3, Check
} from 'lucide-react';
import Link from 'next/link';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  views: number;
  affiliateClicks: number;
  ctr: string;
  categoryName: string;
  productName?: string | null;
  updatedAt: string;
  createdAt: string;
  isStale?: boolean;
  isOrphan?: boolean;
}

export default function AdminContentOptimizationPage() {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<ContentItem[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PUBLISHED' | 'DRAFTS' | 'REVIEW' | 'UPDATE_REQUIRED' | 'ORPHANS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Content Update Assistant Modal
  const [reviewingBlog, setReviewingBlog] = useState<ContentItem | null>(null);
  const [checklist, setChecklist] = useState({
    priceChecked: false,
    specsChecked: false,
    affiliateChecked: false,
    availabilityChecked: false,
    comparisonChecked: false,
    sourcesChecked: false,
    articleUpdated: false,
  });

  const fetchContentData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics');
      const data = await res.json();
      if (data.blogAnalytics) {
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - 14);

        const formatted = data.blogAnalytics.map((b: any) => {
          const updated = new Date(b.createdAt);
          const isStale = updated < thresholdDate;
          const isOrphan = !b.productName && (!b.categoryName || b.categoryName === 'Uncategorized');

          return {
            ...b,
            isStale,
            isOrphan,
          };
        });

        setBlogs(formatted);
      }
    } catch (err) {
      console.error('Error fetching content analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContentData();
  }, []);

  const handleToggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleMarkAsFresh = async () => {
    if (!reviewingBlog) return;
    try {
      await fetch(`/api/blogs/${reviewingBlog.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' }),
      });
      setReviewingBlog(null);
      await fetchContentData();
    } catch (err) {
      alert('Failed to update article status');
    }
  };

  const filteredBlogs = blogs.filter((b) => {
    if (activeTab === 'PUBLISHED' && b.status !== 'PUBLISHED') return false;
    if (activeTab === 'DRAFTS' && b.status !== 'DRAFT') return false;
    if (activeTab === 'REVIEW' && b.status !== 'REVIEW') return false;
    if (activeTab === 'UPDATE_REQUIRED' && !b.isStale && b.status !== 'UPDATE_REQUIRED') return false;
    if (activeTab === 'ORPHANS' && !b.isOrphan) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q);
    }
    return true;
  });

  const publishedCount = blogs.filter((b) => b.status === 'PUBLISHED').length;
  const draftCount = blogs.filter((b) => b.status === 'DRAFT').length;
  const reviewCount = blogs.filter((b) => b.status === 'REVIEW').length;
  const updateReqCount = blogs.filter((b) => b.isStale || b.status === 'UPDATE_REQUIRED').length;
  const orphanCount = blogs.filter((b) => b.isOrphan).length;

  return (
    <div className="space-y-8 pb-16 max-w-6xl">
      {/* Header & Goal Tracker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-500 font-extrabold text-xs uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" /> Editorial Quality &amp; Content Optimization
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Content Optimization &amp; Freshness Hub
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Monitor article views, affiliate clicks, update required flags, orphan content, and daily publishing goals.
          </p>
        </div>

        {/* Content Goal Tracker (PART 28) */}
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600">
            <Target className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="font-bold text-neutral-900 dark:text-white">Daily Publishing Target</div>
            <div className="text-neutral-500 text-[11px]">Today: <strong>1 / 1</strong> • Weekly: <strong>5 / 7</strong></div>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search article titles or slugs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs outline-none focus:border-brand-500 w-full sm:w-64"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-bold overflow-x-auto w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            All ({blogs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PUBLISHED')}
            className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'PUBLISHED'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('REVIEW')}
            className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'REVIEW'
                ? 'bg-orange-500 text-white shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Needs Review ({reviewCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('UPDATE_REQUIRED')}
            className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'UPDATE_REQUIRED'
                ? 'bg-amber-500 text-neutral-950 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Update Required ({updateReqCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ORPHANS')}
            className={`px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'ORPHANS'
                ? 'bg-rose-500 text-white shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Orphans ({orphanCount})
          </button>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 font-bold uppercase text-[10px] tracking-wider border-b border-neutral-100 dark:border-neutral-800">
              <tr>
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Views</th>
                <th className="py-3 px-4">Affiliate Clicks</th>
                <th className="py-3 px-4">Search Clicks</th>
                <th className="py-3 px-4">Freshness</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400">
                    No articles found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white max-w-xs truncate">
                      <Link href={`/admin/blogs/${item.id}`} className="hover:text-brand-600 block truncate">
                        {item.title}
                      </Link>
                      <span className="text-[10px] text-neutral-400 font-normal">
                        /{item.slug} • {item.categoryName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'PUBLISHED'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : item.status === 'REVIEW'
                          ? 'bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-neutral-900 dark:text-white">
                      {item.views.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold font-mono text-[11px]">
                        {item.affiliateClicks} Clicks ({item.ctr})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400 text-[11px] font-mono">
                      Search data unavailable
                    </td>
                    <td className="py-3.5 px-4">
                      {item.isOrphan ? (
                        <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold">
                          Orphan Content
                        </span>
                      ) : item.isStale ? (
                        <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold">
                          Update Required
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold">
                          Fresh
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.isStale && (
                          <button
                            type="button"
                            onClick={() => {
                              setReviewingBlog(item);
                              setChecklist({
                                priceChecked: false,
                                specsChecked: false,
                                affiliateChecked: false,
                                availabilityChecked: false,
                                comparisonChecked: false,
                                sourcesChecked: false,
                                articleUpdated: false,
                              });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-[11px] cursor-pointer"
                          >
                            Review
                          </button>
                        )}
                        <Link
                          href={`/admin/blogs/${item.id}`}
                          className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-[11px]"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Content Update Assistant Checklist Modal (PART 14) */}
      {reviewingBlog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wider">
                  Freshness Assistant
                </span>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white truncate max-w-sm">
                  Review &amp; Update Checklist
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewingBlog(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              Verify the following factual checkpoints before marking <strong>{reviewingBlog.title}</strong> as Fresh:
            </p>

            <div className="space-y-2.5 text-xs">
              {[
                { key: 'priceChecked', label: 'Price checked against live store feeds' },
                { key: 'specsChecked', label: 'Specifications verified with manufacturer datasheets' },
                { key: 'affiliateChecked', label: 'Affiliate links verified with active associate tag' },
                { key: 'availabilityChecked', label: 'Product stock availability confirmed' },
                { key: 'comparisonChecked', label: 'Head-to-head comparison matrices reviewed' },
                { key: 'sourcesChecked', label: 'Official sources and testing notes verified' },
                { key: 'articleUpdated', label: 'Article content and conclusion updated where necessary' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.key as keyof typeof checklist]}
                    onChange={() => handleToggleCheck(item.key as keyof typeof checklist)}
                    className="w-4 h-4 rounded text-brand-600 cursor-pointer"
                  />
                  <span className="text-neutral-800 dark:text-neutral-200 font-medium">{item.label}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setReviewingBlog(null)}
                className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMarkAsFresh}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Article as Fresh</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
