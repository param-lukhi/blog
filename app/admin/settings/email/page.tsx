'use client';

import React, { useEffect, useState } from 'react';
import {
  Mail, CheckCircle2, AlertCircle, RefreshCw,
  Key, ShieldCheck, ArrowUpRight
} from 'lucide-react';

export default function EmailSettingsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = () => {
    setLoading(true);
    fetch('/api/admin/settings/email')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Email Provider Activation</h1>
          </div>
          <p className="text-sm text-slate-400">
            Connect Resend or SendGrid API credentials for newsletter digests and price drop alert delivery.
          </p>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition border border-slate-700 w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Provider Status */}
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
            Status: {data?.status?.isConfigured ? 'CONFIGURED' : 'NOT CONFIGURED'}
          </div>
          <div className="text-slate-400 mt-0.5">{data?.status?.message}</div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 text-xs text-slate-300">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-purple-400" />
          Supported Providers &amp; Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
            <div className="font-bold text-purple-400 text-sm">Resend (Recommended)</div>
            <p className="text-slate-400">
              Create an API key at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">resend.com</a> and verify your sender domain.
            </p>
            <div className="bg-slate-900 p-2 rounded text-slate-300 font-mono text-[11px]">
              RESEND_API_KEY=re_...<br />
              EMAIL_FROM=noreply@blogweb904.com
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2">
            <div className="font-bold text-sky-400 text-sm">SendGrid</div>
            <p className="text-slate-400">
              Create a Restricted API Key with Mail Send permissions at <a href="https://sendgrid.com" target="_blank" rel="noopener noreferrer" className="text-sky-400 underline">sendgrid.com</a>.
            </p>
            <div className="bg-slate-900 p-2 rounded text-slate-300 font-mono text-[11px]">
              SENDGRID_API_KEY=SG....<br />
              EMAIL_FROM=noreply@blogweb904.com
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
