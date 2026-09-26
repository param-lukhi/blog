'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp, Search, FileText, ShoppingBag, DollarSign,
  Mail, Sparkles, AlertCircle, ArrowUpRight, CheckCircle2,
  GitCompare, RefreshCw, BarChart3, Target, Compass
} from 'lucide-react';

export default function GrowthDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = () => {
    setLoading(true);
    fetch('/api/admin/growth/dashboard')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Growth & Revenue Engine</h1>
            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-500/20">
              Phase 8 Active
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Real organic search intelligence, content cluster gaps, and affiliate monetization tracking.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition border border-slate-700 w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* Growth Alerts */}
      {data?.alerts && data.alerts.length > 0 && (
        <div className="space-y-2">
          {data.alerts.map((alert: any, idx: number) => (
            <div
              key={idx}
              className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
                alert.severity === 'WARNING'
                  ? 'bg-amber-950/30 border-amber-800/40 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
              <div>
                <div className="font-semibold">{alert.type}</div>
                <div className="text-slate-400 text-xs mt-0.5">{alert.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Key Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Organic Clicks</span>
            <Search className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {data?.metrics?.totalOrganicClicks || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {data?.gscStatus?.isConfigured ? 'From Search Console' : 'GSC Not Configured'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Affiliate Clicks</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {data?.metrics?.affiliateClicks || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Direct merchant outbound clicks</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Opportunities</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {data?.metrics?.activeOpportunities || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Gaps & high-intent queries</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Subscribers</span>
            <Mail className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {data?.metrics?.subscribersCount || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Active price drop & digest list</div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/content/opportunities"
          className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-6 rounded-2xl transition duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">
              Content Opportunity Engine
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Automated cluster analysis discovering missing comparisons, pillar guides, and high-impression queries.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-400 mt-4">
            Explore Opportunities <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/admin/seo/topical-map"
          className="group bg-slate-900 border border-slate-800 hover:border-sky-500/40 p-6 rounded-2xl transition duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 mb-4 border border-sky-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition">
              Topical Coverage Map
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Visualize category pillars, supporting reviews, comparisons, and orphan pages across the entire site.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-sky-400 mt-4">
            View Topical Hierarchy <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/admin/monetization/revenue"
          className="group bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-6 rounded-2xl transition duration-200 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4 border border-amber-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition">
              Affiliate Revenue & Attribution
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Measured conversion postbacks, link health auditor, and mandatory affiliate disclosure compliance.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-amber-400 mt-4">
            Audit Revenue & Links <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Operational Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              Content Growth Pipeline
            </h2>
            <Link href="/admin/content/calendar" className="text-xs text-emerald-400 hover:underline">
              View Calendar
            </Link>
          </div>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Published Articles</span>
              <span className="font-semibold text-white">{data?.metrics?.publishedBlogs || 0}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Catalog Products</span>
              <span className="font-semibold text-white">{data?.metrics?.publishedProducts || 0}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Published Comparisons</span>
              <span className="font-semibold text-white">{data?.metrics?.comparisonsCount || 0}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Pending Moderation Reviews</span>
              <span className="font-semibold text-amber-400">{data?.metrics?.pendingModeration || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-400" />
              Growth Experiments & A/B Tests
            </h2>
            <Link href="/admin/growth/experiments" className="text-xs text-sky-400 hover:underline">
              Manage Tests
            </Link>
          </div>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">Active Running Experiments</span>
              <span className="font-semibold text-white">{data?.metrics?.activeExperiments || 0}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-400">A/B Testing Safety Status</span>
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enforced
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">Legal/Disclosure Exemptions</span>
              <span className="text-slate-400 text-xs">Strictly excluded from tests</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
