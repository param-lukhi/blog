'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, CheckCircle2, AlertCircle, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

export default function IndexingIssuesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/seo/indexing/issues');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/seo/indexing"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Google Indexing Issue Center</h1>
            </div>
            <p className="text-sm text-slate-400">
              Audit canonical mismatches, sitemap gaps, robots blockages, and Google Search Console crawled-not-indexed URLs.
            </p>
          </div>
        </div>

        <button
          onClick={fetchIssues}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all disabled:opacity-50 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Re-audit Issues
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      ) : data ? (
        <>
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Scanned URLs</span>
              <div className="mt-2 text-3xl font-extrabold text-white">{data.totalChecked}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fully Compliant & Healthy</span>
              <div className="mt-2 text-3xl font-extrabold text-emerald-400">{data.healthyCount}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detected Indexing Issues</span>
              <div className="mt-2 text-3xl font-extrabold text-amber-400">{data.issueCount}</div>
            </div>
          </div>

          {/* Issues List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Active Indexing Diagnostic Issues</h2>
              {data.issues?.length === 0 && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Zero Issues Detected
                </span>
              )}
            </div>

            {data.issues?.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">All Published Content is Compliant</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Canonical URLs, sitemap directives, and metadata adhere to Google Search guidelines.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {data.issues?.map((iss: any) => (
                  <div key={iss.id} className="p-5 hover:bg-slate-800/20 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {iss.severity === 'CRITICAL' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            CRITICAL
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            WARNING
                          </span>
                        )}
                        <span className="font-bold text-white text-sm">{iss.issue}</span>
                      </div>
                      <span className="text-xs text-slate-500">{new Date(iss.detectedAt).toLocaleString()}</span>
                    </div>

                    <div className="mt-2 text-xs font-mono text-indigo-300 truncate max-w-2xl">{iss.url}</div>

                    <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                      <span className="font-bold text-slate-400">Recommended Action: </span>
                      {iss.suggestedAction}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
