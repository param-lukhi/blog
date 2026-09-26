'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3, RefreshCw, FileText, ShoppingBag, DollarSign,
  Mail, MessageSquare, Bell, Search, AlertCircle, ArrowUpRight
} from 'lucide-react';

export default function ProductionAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/analytics/dashboard');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Production Analytics & Performance</h1>
          </div>
          <p className="text-sm text-slate-400">
            Real first-party measured database events and verified external Google Search / affiliate postback signals.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all disabled:opacity-50 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      ) : data ? (
        <>
          {/* Section: 1st Party Measured Telemetry */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                First-Party Measured Metrics (Neon Database)
              </h2>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                100% Measured
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Published Articles</span>
                <div className="mt-2 text-2xl font-extrabold text-white">{data.measured?.publishedArticles}</div>
                <span className="text-[11px] text-slate-500 mt-1 block">Live in database</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Tracked Affiliate Clicks</span>
                <div className="mt-2 text-2xl font-extrabold text-indigo-400">{data.measured?.affiliateClicks}</div>
                <span className="text-[11px] text-slate-500 mt-1 block">Direct store clicks</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Verified Conversions</span>
                <div className="mt-2 text-2xl font-extrabold text-emerald-400">{data.measured?.verifiedConversions}</div>
                <span className="text-[11px] text-slate-500 mt-1 block">Webhook postbacks</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Confirmed Revenue</span>
                <div className="mt-2 text-2xl font-extrabold text-emerald-400">
                  ₹{Number(data.measured?.confirmedRevenue || 0).toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">Verified commissions</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Catalog Products</span>
                <div className="mt-2 text-2xl font-extrabold text-white">{data.measured?.publishedProducts}</div>
                <span className="text-[11px] text-slate-500 mt-1 block">With multi-store prices</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Newsletter Subscribers</span>
                <div className="mt-2 text-2xl font-extrabold text-white">{data.measured?.newsletterSubscribers}</div>
                <span className="text-[11px] text-slate-500 mt-1 block">Active double-opt-in</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Approved Reviews</span>
                <div className="mt-2 text-2xl font-extrabold text-white">{data.measured?.approvedReviews}</div>
                <span className="text-[11px] text-slate-500 mt-1 block">Community rated</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase">Active Price Alerts</span>
                <div className="mt-2 text-2xl font-extrabold text-white">{data.measured?.activePriceAlerts}</div>
                <span className="text-[11px] text-slate-500 mt-1 block">Drop notifications</span>
              </div>
            </div>
          </div>

          {/* Section: External Integrations Transparency */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                External API Telemetry & Telemetry Status
              </h2>
              <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
                Strict Zero-Simulation Policy
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Google Search Console Box */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-white text-sm">Google Search Console Integration</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    {data.externalIntegrations?.googleSearchConsole?.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400">{data.externalIntegrations?.googleSearchConsole?.message}</p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Organic Clicks</span>
                    <div className="text-xs font-mono text-slate-400 mt-1">
                      {data.externalIntegrations?.googleSearchConsole?.organicClicks}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Search Impressions</span>
                    <div className="text-xs font-mono text-slate-400 mt-1">
                      {data.externalIntegrations?.googleSearchConsole?.impressions}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Average CTR</span>
                    <div className="text-xs font-mono text-slate-400 mt-1">
                      {data.externalIntegrations?.googleSearchConsole?.averageCtr}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Average Position</span>
                    <div className="text-xs font-mono text-slate-400 mt-1">
                      {data.externalIntegrations?.googleSearchConsole?.averagePosition}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/admin/settings/search-console"
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                  >
                    Configure Google Service Account <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Affiliate Postbacks Box */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-white text-sm">Merchant Postback Webhooks</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    {data.externalIntegrations?.affiliatePostbacks?.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400">{data.externalIntegrations?.affiliatePostbacks?.message}</p>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  <div className="font-bold text-slate-400 mb-1">Attribution Guarantee:</div>
                  Zero fake conversions or simulated earnings are ever injected. Revenue is recorded exclusively through HMAC-authenticated external affiliate postbacks.
                </div>

                <div className="pt-2">
                  <Link
                    href="/admin/monetization/revenue"
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                  >
                    View Attribution Dashboard <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
