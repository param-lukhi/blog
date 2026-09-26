'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Tv, CheckCircle2, AlertCircle, ShieldCheck,
  RefreshCw, ArrowUpRight, FileText, Lock
} from 'lucide-react';

export default function AdSenseReadinessPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAudit = () => {
    setLoading(true);
    fetch('/api/admin/monetization/adsense')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tv className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Google AdSense Readiness Center</h1>
          </div>
          <p className="text-sm text-slate-400">
            Audit public trust pages, policy compliance, content depth, and technical requirements before applying to Google AdSense.
          </p>
        </div>

        <button
          onClick={fetchAudit}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition border border-slate-700 w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Run Compliance Audit
        </button>
      </div>

      {/* Compliance Disclaimer Notice */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-start gap-3 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">AdSense Readiness Policy: </span>
          {data?.approvalClaimNotice || 'This tool audits compliance readiness and does not claim official AdSense approval.'}
        </div>
      </div>

      {/* Overall Readiness Status */}
      <div className={`p-6 rounded-2xl border flex items-center justify-between ${
        data?.status === 'READY FOR REVIEW'
          ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
          : 'bg-amber-950/40 border-amber-800/50 text-amber-300'
      }`}>
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold">Overall Site Status</div>
          <div className="text-2xl font-bold text-white mt-1">{data?.status || 'AUDITING...'}</div>
          <div className="text-xs text-slate-400 mt-1">
            {data?.metrics?.publishedArticles || 0} published articles ({data?.metrics?.thinArticlesCount || 0} thin articles detected)
          </div>
        </div>

        <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${
          data?.status === 'READY FOR REVIEW'
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
        }`}>
          {data?.status}
        </span>
      </div>

      {/* 2-Column Audits: Public Trust Pages & Technical Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trust Pages */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Mandatory Trust & Policy Pages
          </h2>
          <div className="space-y-3">
            {data?.trustChecklist?.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs">
                <div>
                  <div className="font-semibold text-white">{item.page}</div>
                  <div className="text-slate-500 font-mono mt-0.5">{item.path}</div>
                </div>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Requirements */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-sky-400" />
            Technical & Quality Standards
          </h2>
          <div className="space-y-3">
            {data?.technicalChecklist?.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs">
                <div>
                  <div className="font-semibold text-white">{item.item}</div>
                  <div className="text-slate-400 mt-0.5">{item.details}</div>
                </div>
                <span className="text-sky-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
