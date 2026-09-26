'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, CheckCircle2, AlertTriangle, XCircle,
  RefreshCw, ExternalLink, Filter, Sparkles, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function SeoIssueCenterPage() {
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('OPEN');

  const fetchSeoIssues = () => {
    setLoading(true);
    fetch(`/api/admin/system/seo?status=${statusFilter}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setIssues(data.issues || []);
          setSummary(data.summary || null);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSeoIssues();
  }, [statusFilter]);

  const handleUpdateStatus = async (issueId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/system/seo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId, status }),
      });
      if (res.ok) {
        fetchSeoIssues();
      }
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" /> Technical SEO Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            SEO Health Issue Center & Audit Logs
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Monitor automated scans for missing meta tags, thin content, broken links, and metadata health.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold border border-neutral-200 dark:border-neutral-700"
          >
            <option value="OPEN">Open Issues</option>
            <option value="RESOLVED">Resolved Issues</option>
            <option value="ALL">All Issues</option>
          </select>

          <button
            type="button"
            onClick={fetchSeoIssues}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-xs font-extrabold transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft">
          <div className="text-[11px] font-bold text-rose-500 uppercase tracking-wider mb-1">
            Critical Issues
          </div>
          <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
            {summary?.criticalCount ?? 0}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Thin content / missing indexability</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft">
          <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-1">
            Warnings
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {summary?.warningCount ?? 0}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Short title or meta descriptions</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft">
          <div className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider mb-1">
            Resolved Issues
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {summary?.resolvedCount ?? 0}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Cleaned and fixed content items</p>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
            Detected SEO Anomalies & Action List
          </h3>
          <span className="text-[11px] text-neutral-400 font-mono">
            {issues.length} item{issues.length === 1 ? '' : 's'} listed
          </span>
        </div>

        {issues.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">
            No SEO issues found in this view. All published articles and products meet quality standards.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {issues.map((iss) => (
              <div key={iss.id} className="p-6 space-y-3 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        iss.severity === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {iss.severity}
                    </span>
                    <span className="font-mono text-xs font-bold text-neutral-900 dark:text-white">
                      {iss.issueType}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-neutral-400">
                      [{iss.status}]
                    </span>
                  </div>

                  <p className="text-xs text-neutral-700 dark:text-neutral-300">
                    {iss.message}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-mono pt-1">
                    {iss.entityUrl && (
                      <Link
                        href={iss.entityUrl}
                        target="_blank"
                        className="text-brand-600 hover:underline flex items-center gap-1 font-bold"
                      >
                        <span>Inspect Page</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                    <span>Detected: {new Date(iss.detectedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {iss.status === 'OPEN' ? (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(iss.id, 'RESOLVED')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(iss.id, 'OPEN')}
                      className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-300"
                    >
                      Reopen Issue
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
