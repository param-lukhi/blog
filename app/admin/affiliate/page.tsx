'use client';

import React, { useState, useEffect } from 'react';
import {
  MousePointerClick, ShoppingBag, ExternalLink, RefreshCw,
  TrendingUp, ShieldCheck, Filter, Calendar, BarChart3, Tag,
  DollarSign, CheckCircle2, Clock, AlertCircle, Award
} from 'lucide-react';
import Link from 'next/link';

interface SummaryData {
  totalClicks: number;
  totalConversions: number;
  confirmedConversions: number;
  conversionRate: string;
  pendingCommission: number;
  confirmedCommission: number;
  rejectedCommission: number;
  totalConfirmedRevenue: number;
  conversionDataAvailable: boolean;
  activeStoresCount: number;
  totalPriceAlerts: number;
}

interface StoreStat {
  name: string;
  slug: string;
  clicks: number;
  conversions: number;
  confirmedCommission: number;
}

interface ProductStat {
  id: string;
  name: string;
  slug: string;
  brand: string;
  clicks: number;
  conversions: number;
  confirmedCommission: number;
  priceAlertsCount: number;
  conversionRate: string;
}

interface ConversionItem {
  id: string;
  storeSlug: string;
  externalTransactionId: string;
  productName: string;
  blogTitle: string;
  amount: number | null;
  commission: number;
  currency: string;
  status: string;
  convertedAt: string;
}

interface TopContentItem {
  title: string;
  slug: string;
  views: number;
  clicks: number;
  conversions: number;
  confirmedCommission: number;
  lastClick: string;
}

interface ClickEventItem {
  id: string;
  eventType: string;
  path?: string;
  productName?: string;
  blogTitle?: string;
  timestamp: string;
  referrer: string;
}

export default function AdminAffiliateDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'stores' | 'products' | 'conversions'>('overview');
  const [storeFilter, setStoreFilter] = useState('ALL');
  const [data, setData] = useState<{
    summary: SummaryData;
    stores: StoreStat[];
    productPerformance: ProductStat[];
    topPerformingContent: TopContentItem[];
    conversions: ConversionItem[];
    recentClickEvents: ClickEventItem[];
  } | null>(null);

  const fetchAffiliateData = (store = storeFilter) => {
    setLoading(true);
    const url = store && store !== 'ALL' ? `/api/affiliate?store=${store}` : '/api/affiliate';
    fetch(url)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAffiliateData(storeFilter);
  }, [storeFilter]);

  const summary = data?.summary;

  return (
    <div className="space-y-8 pb-16 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-500 font-extrabold text-xs uppercase tracking-wider mb-1">
            <MousePointerClick className="w-4 h-4" /> Monetization & Revenue Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Affiliate Revenue & Conversion Dashboard
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Track authentic merchant referral clicks, postback conversion webhooks, store performance, and verified commissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
          >
            <option value="ALL">All Stores</option>
            {data?.stores?.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => fetchAffiliateData(storeFilter)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-xs font-extrabold transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Outbound Clicks */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
            Tracked Affiliate Clicks
          </div>
          <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
            {summary?.totalClicks ?? 0}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Outbound merchant clicks</p>
        </div>

        {/* Confirmed Commission */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Confirmed Commission</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            ₹{summary?.confirmedCommission?.toLocaleString() ?? 0}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {summary?.confirmedConversions ?? 0} verified conversions
          </p>
        </div>

        {/* Pending Commission */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft">
          <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Pending Commission</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            ₹{summary?.pendingCommission?.toLocaleString() ?? 0}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Awaiting merchant validation</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft">
          <div className="text-[11px] font-bold text-brand-600 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Conversion Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-brand-500" />
          </div>
          <div className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">
            {summary?.conversionRate ?? '0.0%'}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {summary?.conversionDataAvailable ? 'Based on real postback data' : 'Webhooks not yet received'}
          </p>
        </div>
      </div>

      {/* Webhook & Conversion Notice if no postbacks */}
      {!summary?.conversionDataAvailable && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <div>
            <span className="font-bold">Conversion Data Status: </span>
            No postback webhooks have been received yet from affiliate networks. Clicks are actively tracked, and revenue will populate upon network postback delivery at <code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded font-mono">/api/affiliate/webhook</code>.
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Top Content & Referrals
        </button>
        <button
          onClick={() => setActiveTab('stores')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'stores'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Store Performance ({data?.stores?.length ?? 0})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'products'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Product Performance ({data?.productPerformance?.length ?? 0})
        </button>
        <button
          onClick={() => setActiveTab('conversions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'conversions'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Conversion Logs ({data?.conversions?.length ?? 0})
        </button>
      </div>

      {/* Tab: Overview (Top Content & Click Stream) */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Top Performing Articles Table */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft overflow-hidden">
            <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                  Top Performing Articles & Guides
                </h3>
              </div>
              <span className="text-[11px] text-neutral-400">Ranked by authentic referral engagement</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 font-bold uppercase text-[10px] tracking-wider border-b border-neutral-100 dark:border-neutral-800">
                  <tr>
                    <th className="py-3 px-4">Article / Review</th>
                    <th className="py-3 px-4">Page Views</th>
                    <th className="py-3 px-4">Affiliate Clicks</th>
                    <th className="py-3 px-4">Conversions</th>
                    <th className="py-3 px-4">Confirmed Commission</th>
                    <th className="py-3 px-4 text-right">View Article</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {!data?.topPerformingContent || data.topPerformingContent.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-neutral-400">
                        No affiliate click data recorded yet.
                      </td>
                    </tr>
                  ) : (
                    data.topPerformingContent.map((item, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                          {item.title}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-neutral-600 dark:text-neutral-400">
                          {item.views ?? 0}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-xs font-mono">
                            {item.clicks} Clicks
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-neutral-700 dark:text-neutral-300">
                          {item.conversions ?? 0}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          ₹{item.confirmedCommission?.toLocaleString() ?? 0}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {item.slug ? (
                            <Link
                              href={`/blog/${item.slug}`}
                              target="_blank"
                              className="text-brand-600 hover:underline font-bold inline-flex items-center gap-1"
                            >
                              <span>Live Link</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Click Event Stream */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                Recent Tracked Referral Click Events
              </h3>
              <span className="text-[11px] font-mono text-neutral-400">
                Last {data?.recentClickEvents?.length || 0} events
              </span>
            </div>

            {!data?.recentClickEvents || data.recentClickEvents.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                No outbound clicks recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {data.recentClickEvents.map((evt) => (
                  <div key={evt.id} className="py-3 flex items-center justify-between text-xs gap-4 flex-wrap">
                    <div>
                      <div className="font-bold text-neutral-900 dark:text-white">
                        {evt.blogTitle || evt.productName || evt.path || 'Affiliate Outbound'}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Source: {evt.referrer}
                      </div>
                    </div>
                    <div className="text-right text-[11px] font-mono text-neutral-400">
                      {new Date(evt.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Store Performance */}
      {activeTab === 'stores' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
              Merchant Store Performance Breakdown
            </h3>
            <span className="text-[11px] text-neutral-400">Verified multi-store analytics</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 font-bold uppercase text-[10px] tracking-wider border-b border-neutral-100 dark:border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Merchant Store</th>
                  <th className="py-3 px-4">Store Slug</th>
                  <th className="py-3 px-4">Outbound Clicks</th>
                  <th className="py-3 px-4">Conversions</th>
                  <th className="py-3 px-4">Confirmed Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {data?.stores?.map((st) => (
                  <tr key={st.slug} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                    <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                      {st.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-400">{st.slug}</td>
                    <td className="py-3.5 px-4 font-bold text-purple-600">{st.clicks}</td>
                    <td className="py-3.5 px-4 font-mono">{st.conversions}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      ₹{st.confirmedCommission.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Product Performance */}
      {activeTab === 'products' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
              Product-Level Monetization & Clicks
            </h3>
            <span className="text-[11px] text-neutral-400">Ranked by referral engagement</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 font-bold uppercase text-[10px] tracking-wider border-b border-neutral-100 dark:border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Clicks</th>
                  <th className="py-3 px-4">Price Alerts</th>
                  <th className="py-3 px-4">Conversions</th>
                  <th className="py-3 px-4">Conversion Rate</th>
                  <th className="py-3 px-4">Confirmed Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {!data?.productPerformance || data.productPerformance.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-neutral-400">
                      No product performance recorded yet.
                    </td>
                  </tr>
                ) : (
                  data.productPerformance.map((prod) => (
                    <tr key={prod.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                      <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                        <Link href={`/products/${prod.slug}`} target="_blank" className="hover:underline">
                          {prod.name}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-500">{prod.brand}</td>
                      <td className="py-3.5 px-4 font-bold text-purple-600">{prod.clicks}</td>
                      <td className="py-3.5 px-4 font-mono text-brand-600">{prod.priceAlertsCount}</td>
                      <td className="py-3.5 px-4 font-mono">{prod.conversions}</td>
                      <td className="py-3.5 px-4 font-bold text-neutral-700 dark:text-neutral-300">
                        {prod.conversionRate}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        ₹{prod.confirmedCommission.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Conversions Logs */}
      {activeTab === 'conversions' && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
              Verified Conversion Postback Logs
            </h3>
            <span className="text-[11px] text-neutral-400">Real transaction webhooks</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 font-bold uppercase text-[10px] tracking-wider border-b border-neutral-100 dark:border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Store</th>
                  <th className="py-3 px-4">Product / Blog</th>
                  <th className="py-3 px-4">Order Value</th>
                  <th className="py-3 px-4">Commission</th>
                  <th className="py-3 px-4">Network TX ID</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {!data?.conversions || data.conversions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-neutral-400">
                      No webhook conversions recorded yet. Postbacks will appear automatically.
                    </td>
                  </tr>
                ) : (
                  data.conversions.map((conv) => (
                    <tr key={conv.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            conv.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : conv.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {conv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold uppercase">{conv.storeSlug}</td>
                      <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                        {conv.productName}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {conv.amount ? `₹${conv.amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600 font-mono">
                        ₹{conv.commission.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-400">{conv.externalTransactionId}</td>
                      <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                        {new Date(conv.convertedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
