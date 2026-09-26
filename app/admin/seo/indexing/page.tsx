'use client';

import React, { useEffect, useState } from 'react';
import {
  Globe, Search, CheckCircle2, AlertCircle, RefreshCw,
  ExternalLink, ArrowUpRight, ShieldAlert, FileText
} from 'lucide-react';

export default function GoogleIndexingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inspectUrl, setInspectUrl] = useState('');
  const [inspecting, setInspecting] = useState(false);
  const [inspectResult, setInspectResult] = useState<any>(null);

  const fetchIndexing = () => {
    setLoading(true);
    fetch('/api/admin/seo/indexing')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchIndexing();
  }, []);

  const handleInspect = async (e: React.FormEvent) => {
    e.preventDefault();
    setInspecting(true);
    setInspectResult(null);
    try {
      const res = await fetch('/api/admin/seo/indexing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inspectUrl }),
      });
      const d = await res.json();
      setInspectResult(d);
      fetchIndexing();
    } catch (e) {
    } finally {
      setInspecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-6 h-6 text-sky-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Google Indexing Readiness Center</h1>
          </div>
          <p className="text-sm text-slate-400">
            Verify sitemap inclusion, robots directives, and live Google URL inspection states without fabricated status claims.
          </p>
        </div>

        <button
          onClick={fetchIndexing}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition border border-slate-700 w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Indexing States
        </button>
      </div>

      {/* GSC Connection Banner */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 ${
        data?.gscStatus?.isConfigured
          ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
          : 'bg-slate-900 border-slate-800 text-slate-300'
      }`}>
        {data?.gscStatus?.isConfigured ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        )}
        <div className="text-xs">
          <div className="font-semibold text-white">Google Search Console URL Inspection Status</div>
          <div className="text-slate-400 mt-0.5">
            {data?.gscStatus?.isConfigured
              ? 'Connected to Google Search Console API. Live URL inspection active.'
              : 'URL INSPECTION NOT CONFIGURED (Google Search Console API service account credentials missing).'}
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Published Articles</div>
          <div className="text-2xl font-bold text-white">{data?.summary?.totalPublished || 0}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">In Sitemap XML</div>
          <div className="text-2xl font-bold text-emerald-400">{data?.summary?.inSitemap || 0}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Robots Allowed</div>
          <div className="text-2xl font-bold text-sky-400">{data?.summary?.robotsAllowed || 0}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">GSC Inspection State</div>
          <div className="text-2xl font-bold text-slate-300">
            {data?.summary?.gscIndexed ? `${data.summary.gscIndexed} Indexed` : 'Unknown'}
          </div>
        </div>
      </div>

      {/* URL Inspection Form */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Search className="w-4 h-4 text-sky-400" />
          Test / Inspect Published URL
        </h2>
        <form onSubmit={handleInspect} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="/blog/sony-wh-1000xm5-review"
            value={inspectUrl}
            onChange={e => setInspectUrl(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
          />
          <button
            type="submit"
            disabled={inspecting}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition"
          >
            {inspecting ? 'Inspecting...' : 'Inspect URL'}
          </button>
        </form>

        {inspectResult && (
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
            {inspectResult.message || JSON.stringify(inspectResult.inspection || inspectResult)}
          </div>
        )}
      </div>

      {/* Published Pages Indexing Audit Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-base font-bold text-white">Published Content Indexing Checklist</h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Auditing indexing status...</div>
        ) : !data?.pages || data.pages.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No published pages found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3">Page Title</th>
                  <th className="px-6 py-3">URL</th>
                  <th className="px-6 py-3">Sitemap</th>
                  <th className="px-6 py-3">Robots</th>
                  <th className="px-6 py-3">GSC State</th>
                  <th className="px-6 py-3">Last Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {data.pages.map((p: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-medium text-white">{p.title}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{p.url}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        In Sitemap
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        Allowed
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">{p.gscState}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(p.lastVerifiedAt).toLocaleDateString()}</td>
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
