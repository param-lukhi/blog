'use client';

import React, { useEffect, useState } from 'react';
import {
  Search, RefreshCw, AlertCircle, CheckCircle2,
  TrendingUp, MousePointer, Eye, Percent, Compass
} from 'lucide-react';

export default function SearchConsolePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('28d');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const fetchData = (p = period) => {
    setLoading(true);
    fetch(`/api/admin/seo/search-console?period=${p}`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch('/api/admin/seo/search-console', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        setSyncMsg('Sync completed successfully.');
      } else {
        setSyncMsg('Search Console not configured in environment.');
      }
      fetchData();
    } catch (e) {
      setSyncMsg('Sync error occurred.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-6 h-6 text-sky-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Google Search Console Integration</h1>
          </div>
          <p className="text-sm text-slate-400">
            Real search impressions, click-through rates, and keyword rankings from Google Search.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="28d">Last 28 Days</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="12m">Last 12 Months</option>
          </select>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync GSC Data'}
          </button>
        </div>
      </div>

      {/* Sync Message */}
      {syncMsg && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
          {syncMsg}
        </div>
      )}

      {/* Configuration Status Banner */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 ${
        data?.status?.isConfigured
          ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
          : 'bg-slate-900 border-slate-800 text-slate-300'
      }`}>
        {data?.status?.isConfigured ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        )}
        <div className="text-xs">
          <div className="font-semibold text-white">
            Status: {data?.status?.isConfigured ? 'CONNECTED' : 'NOT CONFIGURED'}
          </div>
          <div className="text-slate-400 mt-0.5">{data?.status?.message}</div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Clicks</span>
            <MousePointer className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">{data?.metrics?.clicks || 0}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Impressions</span>
            <Eye className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{data?.metrics?.impressions || 0}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Average CTR</span>
            <Percent className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {(data?.metrics?.ctr || 0).toFixed(2)}%
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Position</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {(data?.metrics?.position || 0).toFixed(1)}
          </div>
        </div>
      </div>

      {/* Top Queries Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Top Search Queries</h2>
          <span className="text-xs text-slate-500">Showing top 20 queries</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading Search Console records...</div>
        ) : !data?.topQueries || data.topQueries.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No Search Console performance records imported yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3">Query</th>
                  <th className="px-6 py-3">Page</th>
                  <th className="px-6 py-3 text-right">Clicks</th>
                  <th className="px-6 py-3 text-right">Impressions</th>
                  <th className="px-6 py-3 text-right">CTR</th>
                  <th className="px-6 py-3 text-right">Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {data.topQueries.map((q: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-medium text-white">{q.query}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs font-mono">{q.page}</td>
                    <td className="px-6 py-4 text-right">{q.clicks}</td>
                    <td className="px-6 py-4 text-right">{q.impressions}</td>
                    <td className="px-6 py-4 text-right font-medium text-sky-400">{q.ctr.toFixed(1)}%</td>
                    <td className="px-6 py-4 text-right font-medium text-amber-400">{q.position.toFixed(1)}</td>
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
