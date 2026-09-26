'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles, TrendingUp, Search, FileText, ArrowUpRight,
  HelpCircle, RefreshCw, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function SeoPerformancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    fetch('/api/admin/seo/performance')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Query Opportunities & Page Performance</h1>
          </div>
          <p className="text-sm text-slate-400">
            Identify high-impression low-CTR queries and review organic-to-affiliate conversion performance per page.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition border border-slate-700 w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Analysis
        </button>
      </div>

      {/* Query Opportunities Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-sky-400" />
            Potential Query Opportunities
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Queries with meaningful impression volume on page 1/2 with room for CTR optimization.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Evaluating query opportunities...</div>
        ) : !data?.queryOpportunities || data.queryOpportunities.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No query opportunities detected yet. Sync Search Console data to populate real opportunities.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3">Query</th>
                  <th className="px-6 py-3">Target Page</th>
                  <th className="px-6 py-3 text-right">Impressions</th>
                  <th className="px-6 py-3 text-right">Position</th>
                  <th className="px-6 py-3 text-right">CTR</th>
                  <th className="px-6 py-3">Suggested Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {data.queryOpportunities.map((op: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-semibold text-white">{op.query}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{op.page}</td>
                    <td className="px-6 py-4 text-right font-medium">{op.impressions}</td>
                    <td className="px-6 py-4 text-right font-medium text-amber-400">{op.position.toFixed(1)}</td>
                    <td className="px-6 py-4 text-right font-medium text-sky-400">{op.ctr.toFixed(1)}%</td>
                    <td className="px-6 py-4 text-xs text-slate-300">{op.suggestedAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Page Performance Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Page Performance & Affiliate Activity
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-analyzing page search visibility against recorded affiliate link clicks.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading page performances...</div>
        ) : !data?.pagePerformances || data.pagePerformances.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No published articles found in catalog.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3">Article Title</th>
                  <th className="px-6 py-3 text-right">GSC Clicks</th>
                  <th className="px-6 py-3 text-right">Impressions</th>
                  <th className="px-6 py-3 text-right">Affiliate Clicks</th>
                  <th className="px-6 py-3 text-right">Conversions</th>
                  <th className="px-6 py-3">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {data.pagePerformances.map((p: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{p.title}</div>
                      <div className="text-xs font-mono text-slate-500">{p.url}</div>
                    </td>
                    <td className="px-6 py-4 text-right">{p.clicks}</td>
                    <td className="px-6 py-4 text-right">{p.impressions}</td>
                    <td className="px-6 py-4 text-right font-semibold text-emerald-400">{p.affiliateClicks}</td>
                    <td className="px-6 py-4 text-right">{p.conversions}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">{new Date(p.lastUpdated).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
