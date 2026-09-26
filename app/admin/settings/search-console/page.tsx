'use client';

import React, { useEffect, useState } from 'react';
import {
  Search, CheckCircle2, AlertCircle, RefreshCw,
  Lock, ArrowUpRight, ShieldCheck, Key
} from 'lucide-react';

export default function SearchConsoleWizardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const fetchStatus = () => {
    setLoading(true);
    fetch('/api/admin/settings/search-console')
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

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/settings/search-console', { method: 'POST' });
      const d = await res.json();
      setTestResult(d);
    } catch (e) {
      setTestResult({ message: 'Error executing connection test.' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-6 h-6 text-sky-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Google Search Console Activation Wizard</h1>
          </div>
          <p className="text-sm text-slate-400">
            Step-by-step setup guide for connecting your Google Cloud Service Account to Google Search Console API.
          </p>
        </div>

        <button
          onClick={handleTest}
          disabled={testing}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition"
        >
          <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      {/* Current Connection Status */}
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
            Connection State: {data?.status?.isConfigured ? 'CONNECTED' : 'NOT CONFIGURED'}
          </div>
          <div className="text-slate-400 mt-0.5">{data?.status?.message}</div>
        </div>
      </div>

      {testResult && (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
          <span className="font-bold text-white">Test Result: </span>
          {testResult.isConfigured ? 'Connection test succeeded.' : 'Credentials not configured in environment.'}
        </div>
      )}

      {/* 6-Step Setup Instructions */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-sky-400" />
          Setup Instructions
        </h2>

        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
            <div className="font-bold text-sky-400">Step 1: Create Google Cloud Service Account</div>
            <p className="text-slate-400">
              Visit Google Cloud Console &gt; IAM &amp; Admin &gt; Service Accounts. Create a service account named <code className="text-slate-200">blogweb904-gsc-sync</code>.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
            <div className="font-bold text-sky-400">Step 2: Enable Google Search Console API</div>
            <p className="text-slate-400">
              In Google Cloud Console, enable the <strong>Google Search Console API (Webmasters API)</strong> for your project.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
            <div className="font-bold text-sky-400">Step 3: Add Service Account to Search Console Property</div>
            <p className="text-slate-400">
              In Google Search Console &gt; Settings &gt; Users and Permissions, add your Service Account email (<code className="text-slate-200">...@...gserviceaccount.com</code>) with <strong>Full / Restricted</strong> permissions.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-1">
            <div className="font-bold text-sky-400">Step 4: Set Environment Variables in Vercel</div>
            <p className="text-slate-400">
              Add the following environment variables in Vercel Project Settings:
            </p>
            <ul className="list-disc pl-5 space-y-0.5 text-slate-400 font-mono mt-2">
              <li>GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL</li>
              <li>GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY</li>
              <li>GOOGLE_SEARCH_CONSOLE_SITE_URL</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
