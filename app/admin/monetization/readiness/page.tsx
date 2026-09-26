'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3, DollarSign, CheckCircle2, AlertCircle,
  RefreshCw, ArrowUpRight, ShieldCheck, Mail, Tv
} from 'lucide-react';

export default function MonetizationReadinessPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReadiness = () => {
    setLoading(true);
    fetch('/api/admin/monetization/readiness')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchReadiness();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Monetization Readiness Report</h1>
          </div>
          <p className="text-sm text-slate-400">
            Audit readiness across Affiliate feeds, Google AdSense, Newsletter monetization, and Price Alerts.
          </p>
        </div>

        <button
          onClick={fetchReadiness}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition border border-slate-700 w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Audit
        </button>
      </div>

      {/* Summary Scorecard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-xs uppercase tracking-wider text-slate-400">Total Monetization Channels</div>
          <div className="text-2xl font-bold text-white mt-1">{data?.summary?.totalChannels || 0}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-xs uppercase tracking-wider text-emerald-400">Channels Ready</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{data?.summary?.readyCount || 0}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="text-xs uppercase tracking-wider text-amber-400">Configuration Required</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{data?.summary?.configurationRequiredCount || 0}</div>
        </div>
      </div>

      {/* Channel Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Evaluating monetization readiness...</div>
        ) : !data?.channels ? (
          <div className="text-center py-12 text-slate-400">No channels found.</div>
        ) : (
          data.channels.map((ch: any, idx: number) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base">{ch.channel}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                    ch.status === 'READY'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : ch.status === 'CONFIGURATION REQUIRED'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {ch.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{ch.details}</p>
              </div>

              {ch.channel === 'Amazon Associates' && (
                <Link
                  href="/admin/settings"
                  className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                >
                  Configure Tag <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )}
              {ch.channel === 'Google AdSense' && (
                <Link
                  href="/admin/monetization/adsense"
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-medium"
                >
                  AdSense Audit <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )}
              {ch.channel === 'Newsletter Monetization & Digests' && (
                <Link
                  href="/admin/settings/email"
                  className="text-xs text-purple-400 hover:underline flex items-center gap-1 font-medium"
                >
                  Email Setup <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
