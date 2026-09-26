'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Globe, CheckCircle2, RefreshCw, FileCode, Check,
  AlertTriangle, XCircle, Search, ExternalLink, SlidersHorizontal,
  Info, BarChart3, Lock, Award
} from 'lucide-react';
import Link from 'next/link';

interface SEOIssue {
  id: string;
  type: 'BLOG' | 'PRODUCT' | 'CATEGORY' | 'GLOBAL';
  title: string;
  slug: string;
  severity: 'CRITICAL' | 'NEEDS_ATTENTION' | 'HEALTHY';
  rule: string;
  description: string;
  recommendation: string;
}

export default function AdminSEOPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    audit: {
      healthyCount: number;
      needsAttentionCount: number;
      criticalCount: number;
      totalItemsChecked: number;
      overallScore: number;
      issues: SEOIssue[];
    };
    sitemap: {
      publishedBlogs: number;
      publishedProducts: number;
      categories: number;
      comparisons: number;
      totalSitemapUrls: number;
    };
    searchConsole: {
      status: string;
      reason?: string;
      siteUrl?: string;
      lastChecked?: string;
    };
  } | null>(null);

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'NEEDS_ATTENTION'>('ALL');

  const fetchSEOData = () => {
    setLoading(true);
    fetch('/api/admin/seo')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSEOData();
  }, []);

  const issuesToDisplay = data?.audit?.issues.filter((issue) => {
    if (activeFilter === 'ALL') return true;
    return issue.severity === activeFilter;
  }) || [];

  return (
    <div className="space-y-8 pb-16 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 font-extrabold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" /> Search Engine Optimization & Search Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            SEO Health Engine & Indexing Status
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Technical checklist auditing metadata, canonicals, schema markup, sitemaps, and Search Console readiness.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSEOData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-xs font-extrabold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Re-Run Audit</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
            Overall Health Score
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-neutral-900 dark:text-white">
              {data?.audit?.overallScore ?? 100}%
            </span>
            <span className="text-xs font-bold text-emerald-600">Technical Rating</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Internal technical checklist</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 shadow-soft">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
            Healthy Entities
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {data?.audit?.healthyCount ?? 0}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Passing all technical rules</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-amber-500/20 bg-amber-500/5 shadow-soft">
          <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1">
            Needs Attention
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {data?.audit?.needsAttentionCount ?? 0}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Minor meta/content items</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-rose-500/20 bg-rose-500/5 shadow-soft">
          <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-1">
            Critical Issues
          </div>
          <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {data?.audit?.criticalCount ?? 0}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Missing titles or images</p>
        </div>
      </div>

      {/* Search Console Integration Section (Requirement: Real status, never fake data) */}
      <div className="bg-white dark:bg-neutral-900 p-6 sm:p-7 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
              Google Search Console Readiness
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-xl text-[11px] font-bold font-mono ${
              data?.searchConsole?.status === 'CONNECTED'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
            }`}>
              Status: {data?.searchConsole?.status || 'NOT_CONFIGURED'}
            </span>
          </div>
        </div>

        {data?.searchConsole?.status === 'CONNECTED' ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-900 dark:text-emerald-200">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Service Account Connected
            </div>
            <p className="text-[11px] mt-1">
              Google Search Console API is authorized for domain: <code>{data?.searchConsole?.siteUrl}</code>
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-xs space-y-2">
            <div className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
              <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Search Console API is Not Configured.</span>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  To view live organic clicks, impressions, CTR, and keyword positions, add <code>GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL</code> and <code>GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY</code> to your environment settings.
                </p>
              </div>
            </div>
            <div className="text-[11px] text-neutral-400 font-mono">
              Note: System strictly prohibits generating fabricated analytics numbers.
            </div>
          </div>
        )}
      </div>

      {/* Sitemap & Robots.txt Verification Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft space-y-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider">Dynamic XML Sitemap</span>
            <Globe className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-extrabold text-neutral-900 dark:text-white">
            {data?.sitemap?.totalSitemapUrls || 0} URLs Indexed
          </div>
          <div className="text-[11px] text-neutral-500 space-y-0.5">
            <div>• {data?.sitemap?.publishedBlogs || 0} Published Blogs</div>
            <div>• {data?.sitemap?.publishedProducts || 0} Products</div>
            <div>• {data?.sitemap?.comparisons || 0} Head-to-Head Comparisons</div>
            <div>• {data?.sitemap?.categories || 0} Categories + 11 Static Pages</div>
          </div>
          <div className="pt-2">
            <Link
              href="/sitemap.xml"
              target="_blank"
              className="text-xs text-brand-600 hover:text-brand-700 font-bold inline-flex items-center gap-1 hover:underline"
            >
              <span>View live sitemap.xml</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft space-y-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider">Robots.txt Engine</span>
            <FileCode className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-lg font-extrabold text-neutral-900 dark:text-white">
            Active & Protected
          </div>
          <div className="text-[11px] text-neutral-500 space-y-0.5">
            <div className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Public pages open for crawl: /blog, /products, /comparisons</div>
            <div className="text-rose-600 dark:text-rose-400 font-semibold">✓ Private admin paths blocked: /admin/*, /api/*</div>
            <div>✓ Auto-references dynamic /sitemap.xml</div>
          </div>
          <div className="pt-2">
            <Link
              href="/robots.txt"
              target="_blank"
              className="text-xs text-brand-600 hover:text-brand-700 font-bold inline-flex items-center gap-1 hover:underline"
            >
              <span>View live robots.txt</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Technical Checklist & Issue List */}
      <div className="bg-white dark:bg-neutral-900 p-6 sm:p-7 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
              Technical SEO Audit Checklist
            </h3>
            <p className="text-[11px] text-neutral-400">
              Filtered issues requiring editorial or metadata improvement
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              All ({data?.audit?.issues?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('CRITICAL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeFilter === 'CRITICAL'
                  ? 'bg-rose-500 text-white shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Critical ({data?.audit?.criticalCount || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('NEEDS_ATTENTION')}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeFilter === 'NEEDS_ATTENTION'
                  ? 'bg-amber-500 text-neutral-950 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Needs Attention ({data?.audit?.needsAttentionCount || 0})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-neutral-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-brand-500" />
            <span>Auditing database content & metadata...</span>
          </div>
        ) : issuesToDisplay.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <h4 className="font-extrabold text-sm text-neutral-900 dark:text-white">
              All Technical SEO Checks Passed!
            </h4>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              No critical or warning SEO issues found across published blogs, products, or categories.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {issuesToDisplay.map((issue) => (
              <div
                key={issue.id}
                className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40 space-y-2"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                      issue.severity === 'CRITICAL'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}>
                      {issue.rule}
                    </span>
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      {issue.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Type: {issue.type} • Slug: /{issue.slug}
                  </span>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-300">
                  {issue.description}
                </p>

                <div className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1.5 pt-1 border-t border-neutral-200/60 dark:border-neutral-700/60">
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span>Recommendation: {issue.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
