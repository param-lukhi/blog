'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Globe, ArrowLeft, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

export default function ProductionUrlAuditPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUrls = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/launch/urls');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VALID':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Valid
          </span>
        );
      case 'INVALID_LOCALHOST':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3" /> Localhost Detected
          </span>
        );
      case 'INVALID_HTTP':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" /> Insecure HTTP
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/launch"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-6 h-6 text-indigo-400" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Production URL & Domain Audit</h1>
            </div>
            <p className="text-sm text-slate-400">
              Scans public metadata, canonicals, sitemap links, and asset sources for staging/localhost references.
            </p>
          </div>
        </div>

        <button
          onClick={fetchUrls}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all disabled:opacity-50 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Re-scan Routes
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      ) : data ? (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Scanned Routes</span>
              <div className="mt-2 text-3xl font-extrabold text-white">{data.totalAudited}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clean & HTTPS Valid</span>
              <div className="mt-2 text-3xl font-extrabold text-emerald-400">{data.healthyCount}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Issues Requiring Review</span>
              <div className="mt-2 text-3xl font-extrabold text-rose-400">{data.invalidCount}</div>
            </div>
          </div>

          {/* URL Records Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">Scanned Route Inventory</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/60 text-xs font-bold text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Location / Resource</th>
                    <th className="px-4 py-3">Current Value</th>
                    <th className="px-4 py-3">Expected Production Format</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.urls?.map((u: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-300 text-xs">{u.urlType}</td>
                      <td className="px-4 py-3 font-medium text-white">{u.location}</td>
                      <td className="px-4 py-3 text-xs text-slate-300 font-mono truncate max-w-xs">{u.currentValue}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 font-mono truncate max-w-xs">{u.expectedValue}</td>
                      <td className="px-4 py-3">{getStatusBadge(u.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
