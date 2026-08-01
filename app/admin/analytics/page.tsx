'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3, MousePointerClick, Eye, Globe, Search, ArrowUpRight,
  ChevronDown, ChevronUp, FileText, ShoppingBag, ExternalLink, Sparkles, TrendingUp, Tag
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface BlogAnalyticsItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  categoryName: string;
  views: number;
  affiliateClicks: number;
  ctr: string;
  createdAt: string;
  productName: string | null;
  productPrice: string | null;
  featuredImage: string;
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        if (data.blogAnalytics && data.blogAnalytics.length > 0) {
          // Select first blog by default
          setSelectedBlogId(data.blogAnalytics[0].id);
        }
      });
  }, []);

  const blogAnalytics: BlogAnalyticsItem[] = stats?.blogAnalytics || [];

  const filteredBlogs = blogAnalytics.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedBlog = blogAnalytics.find((b) => b.id === selectedBlogId);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
          Click Tracking & Traffic Analytics
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Detailed real-time breakdown of page views, affiliate link CTR, and per-blog conversion performance.
        </p>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-soft">
          <div className="text-xs font-bold text-neutral-400 uppercase">Total Impressions</div>
          <div className="text-3xl font-extrabold text-neutral-900 mt-1">{stats?.totalVisitors}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-soft">
          <div className="text-xs font-bold text-neutral-400 uppercase">Affiliate Link Clicks</div>
          <div className="text-3xl font-extrabold text-amber-600 mt-1">{stats?.affiliateClicks}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-soft">
          <div className="text-xs font-bold text-neutral-400 uppercase">Click-Through-Rate (CTR)</div>
          <div className="text-3xl font-extrabold text-brand-600 mt-1">{stats?.ctr}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-soft">
          <div className="text-xs font-bold text-neutral-400 uppercase">Today&apos;s Traffic</div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-1">{stats?.todayVisitors}</div>
        </div>
      </div>

      {/* Referral Sources & Keywords */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-soft space-y-4">
          <h2 className="font-extrabold text-neutral-900 text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-600" />
            <span>Referral Sources</span>
          </h2>
          <ul className="space-y-3 text-xs text-neutral-700">
            <li className="flex justify-between border-b border-neutral-100 pb-2">
              <span>Google Organic Search</span>
              <strong className="text-neutral-900">68%</strong>
            </li>
            <li className="flex justify-between border-b border-neutral-100 pb-2">
              <span>Direct Traffic</span>
              <strong className="text-neutral-900">18%</strong>
            </li>
            <li className="flex justify-between border-b border-neutral-100 pb-2">
              <span>Social Media (Twitter/FB)</span>
              <strong className="text-neutral-900">14%</strong>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-soft space-y-4">
          <h2 className="font-extrabold text-neutral-900 text-sm flex items-center gap-2">
            <Search className="w-4 h-4 text-emerald-600" />
            <span>Popular Visitor Keywords</span>
          </h2>
          <ul className="space-y-3 text-xs text-neutral-700">
            <li className="flex justify-between border-b border-neutral-100 pb-2">
              <span>&ldquo;best smartphone 2026 review&rdquo;</span>
              <strong className="text-neutral-900">142 searches</strong>
            </li>
            <li className="flex justify-between border-b border-neutral-100 pb-2">
              <span>&ldquo;macbook air m3 price drop&rdquo;</span>
              <strong className="text-neutral-900">98 searches</strong>
            </li>
            <li className="flex justify-between border-b border-neutral-100 pb-2">
              <span>&ldquo;sony xm5 noise cancel review&rdquo;</span>
              <strong className="text-neutral-900">76 searches</strong>
            </li>
          </ul>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🚀 PER-BLOG PERFORMANCE ANALYTICS SECTION (USER REQUEST)  */}
      {/* ======================================================== */}
      <section className="bg-white rounded-3xl border border-neutral-200/90 p-6 sm:p-8 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4" /> Individual Blog Performance Metrics
            </span>
            <h2 className="text-xl font-extrabold text-neutral-900 mt-1">
              Blog Article Views, Clicks & Conversion Reports
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Click any blog from the list below to inspect its individual page views, Amazon link clicks, and CTR %.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search blog list..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:border-brand-500"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Selected Blog Detail Card */}
        {selectedBlog && (
          <div className="bg-gradient-to-r from-brand-900 via-neutral-900 to-neutral-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[10px] font-extrabold uppercase tracking-wider">
                  {selectedBlog.categoryName}
                </span>
                <h3 className="text-xl font-extrabold text-white mt-2 leading-snug">
                  {selectedBlog.title}
                </h3>
                {selectedBlog.productName && (
                  <p className="text-xs text-neutral-400">
                    Recommended Product: <strong className="text-white">{selectedBlog.productName}</strong> ({selectedBlog.productPrice})
                  </p>
                )}
              </div>

              <Link
                href={`/blog/${selectedBlog.slug}`}
                target="_blank"
                className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shrink-0 transition-colors"
              >
                <span>View Article Live</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Page Views */}
              <div className="p-4 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase">
                  <span>Page Views</span>
                  <Eye className="w-4 h-4 text-brand-400" />
                </div>
                <div className="text-3xl font-extrabold text-white">
                  {selectedBlog.views.toLocaleString()}
                </div>
                <div className="text-[11px] text-neutral-400">Total reader visits</div>
              </div>

              {/* Affiliate Clicks */}
              <div className="p-4 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase">
                  <span>Amazon Link Clicks</span>
                  <MousePointerClick className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-extrabold text-amber-400">
                  {selectedBlog.affiliateClicks.toLocaleString()}
                </div>
                <div className="text-[11px] text-neutral-400">Outbound buy button clicks</div>
              </div>

              {/* CTR % */}
              <div className="p-4 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 space-y-2">
                <div className="flex items-center justify-between text-neutral-400 text-xs font-bold uppercase">
                  <span>Click-Through Rate (CTR)</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-400">
                  {selectedBlog.ctr}
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold">High Converting Review</div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Interactive List Table */}
        <div className="border border-neutral-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 font-bold text-neutral-500 uppercase tracking-wider">
                  <th className="p-4">Blog Article Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-center">👁️ Page Views</th>
                  <th className="p-4 text-center">🛒 Affiliate Clicks</th>
                  <th className="p-4 text-center">📊 CTR %</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredBlogs.map((b) => {
                  const isSelected = b.id === selectedBlogId;
                  return (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedBlogId(b.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-brand-50/70 font-bold text-brand-900'
                          : 'hover:bg-neutral-50 text-neutral-800'
                      }`}
                    >
                      <td className="p-4 max-w-sm truncate">
                        <div className="font-bold">{b.title}</div>
                        <div className="text-[10px] text-neutral-400 font-normal">
                          {formatDate(b.createdAt)}
                        </div>
                      </td>
                      <td className="p-4 text-neutral-600 font-medium">{b.categoryName}</td>
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-neutral-100 font-extrabold text-neutral-800">
                          {b.views.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-extrabold">
                          {b.affiliateClicks.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold">
                          {b.ctr}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBlogId(b.id);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-brand-600 text-white'
                              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          }`}
                        >
                          {isSelected ? 'Viewing Analytics' : 'View Breakdown'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
