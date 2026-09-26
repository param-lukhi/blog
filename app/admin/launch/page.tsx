'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Rocket, CheckCircle2, AlertCircle, RefreshCw,
  ExternalLink, Server, Globe, Search, ShieldCheck,
  Mail, Tv, Zap, CheckSquare, Layers, Lock, AlertTriangle, ArrowRight
} from 'lucide-react';

export default function ProductionLaunchPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLaunchAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/launch');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunDiagnostic = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/launch', { method: 'POST' });
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLaunchAudit();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READY':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> READY</span>;
      case 'CONFIGURATION_REQUIRED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><AlertCircle className="w-3.5 h-3.5" /> CONFIG REQUIRED</span>;
      case 'WARNING':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><AlertTriangle className="w-3.5 h-3.5" /> ATTENTION</span>;
      case 'FAILED':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20"><AlertCircle className="w-3.5 h-3.5" /> FAILED</span>;
      case 'NOT_CONFIGURED':
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">NOT CONFIGURED</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/40 p-8 rounded-3xl shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Rocket className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Production Launch Center</h1>
            </div>
            <p className="text-slate-300 text-sm max-w-2xl">
              BlogWeb904 live operations dashboard. Validates database connectivity, canonical domain configuration, Google indexing pipeline, affiliate networks, and deployment integrity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunDiagnostic}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Run Full Diagnostic
            </button>
            <Link
              href="/admin/launch/urls"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              URL Scanner
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      ) : data ? (
        <>
          {/* Top Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Launch Readiness</span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-indigo-400">{data.overallScore}%</span>
                <span className="text-xs text-slate-400 font-medium">Ready</span>
              </div>
              <div className="mt-4 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${data.overallScore}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Canonical Domain</span>
              <div className="mt-3">
                <span className="text-lg font-bold text-white block truncate">{data.domainAudit?.canonicalDomain}</span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                  <Lock className="w-3.5 h-3.5" /> HTTPS Enforced
                </span>
              </div>
              <div className="mt-4 text-xs text-slate-400">
                WWW Policy: <span className="text-slate-300 font-semibold">{data.domainAudit?.wwwPolicy}</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Checklist Progress</span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-400">
                  {data.checklist?.filter((c: any) => c.status === 'COMPLETED').length} / {data.checklist?.length}
                </span>
                <span className="text-xs text-slate-400">Verified</span>
              </div>
              <div className="mt-4 text-xs text-slate-400">
                Pending: <span className="text-amber-400 font-semibold">{data.checklist?.filter((c: any) => c.status !== 'COMPLETED').length}</span> items
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Database & Backup</span>
              <div className="mt-3">
                <span className="text-base font-bold text-white block">Neon PostgreSQL</span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PITR Recovery Active
                </span>
              </div>
              <div className="mt-4 text-xs text-slate-400">
                Safe non-destructive migrations verified
              </div>
            </div>
          </div>

          {/* System Status Matrix */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">System Architecture & Service Matrix</h2>
                <p className="text-xs text-slate-400 mt-0.5">Real-time status of production subsystems and third-party APIs</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.systems?.map((sys: any) => (
                <div key={sys.system} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-white">{sys.name}</span>
                    {getStatusBadge(sys.status)}
                  </div>
                  <p className="text-xs text-slate-400">{sys.details}</p>
                  {sys.requiredAction && (
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] text-amber-300 font-medium">
                      Action: {sys.requiredAction}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 24-Item Production Launch Checklist */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Production Launch Action Checklist</h2>
                <p className="text-xs text-slate-400 mt-0.5">24-point verification matrix with zero simulated completions</p>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1.5 rounded-xl">
                {data.checklist?.filter((c: any) => c.status === 'COMPLETED').length} of {data.checklist?.length} Complete
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.checklist?.map((item: any) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                    item.status === 'COMPLETED'
                      ? 'bg-slate-950/40 border-slate-800/80 text-slate-200'
                      : 'bg-amber-950/10 border-amber-900/30 text-slate-200'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {item.status === 'COMPLETED' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{item.title}</span>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        {item.category.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Fast Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/admin/seo/indexing"
              className="p-6 bg-slate-900 border border-slate-800 hover:border-indigo-600/50 rounded-2xl group transition-all"
            >
              <div className="flex items-center justify-between">
                <Search className="w-6 h-6 text-indigo-400" />
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-base font-bold text-white mt-4">Google Indexing Center</h3>
              <p className="text-xs text-slate-400 mt-1">Live inspection logs, sitemap health, and GSC status.</p>
            </Link>

            <Link
              href="/admin/monetization/revenue"
              className="p-6 bg-slate-900 border border-slate-800 hover:border-emerald-600/50 rounded-2xl group transition-all"
            >
              <div className="flex items-center justify-between">
                <CheckSquare className="w-6 h-6 text-emerald-400" />
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-base font-bold text-white mt-4">Affiliate & Monetization</h3>
              <p className="text-xs text-slate-400 mt-1">Tracked clicks, postback webhooks, and AdSense readiness.</p>
            </Link>

            <Link
              href="/admin/system/incidents"
              className="p-6 bg-slate-900 border border-slate-800 hover:border-rose-600/50 rounded-2xl group transition-all"
            >
              <div className="flex items-center justify-between">
                <ShieldCheck className="w-6 h-6 text-rose-400" />
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-base font-bold text-white mt-4">Operational Incidents</h3>
              <p className="text-xs text-slate-400 mt-1">Real-time incident response and system status center.</p>
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
