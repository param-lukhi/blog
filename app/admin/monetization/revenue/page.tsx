'use client';

import React, { useEffect, useState } from 'react';
import {
  DollarSign, ArrowUpRight, CheckCircle2, AlertCircle,
  RefreshCw, ShieldCheck, Link2, ShoppingBag, BarChart3
} from 'lucide-react';

export default function AffiliateRevenuePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchRevenue = () => {
    setLoading(true);
    fetch('/api/admin/monetization/revenue')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Affiliate Revenue & Attribution</h1>
          </div>
          <p className="text-sm text-slate-400">
            Real tracked merchant clicks, verified conversion webhooks, link health audits, and disclosure compliance.
          </p>
        </div>

        <button
          onClick={fetchRevenue}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition border border-slate-700 w-fit"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Revenue
        </button>
      </div>

      {/* Conversion Data Availability Banner */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 ${
        data?.metrics?.isConversionDataAvailable
          ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
          : 'bg-slate-900 border-slate-800 text-slate-300'
      }`}>
        {data?.metrics?.isConversionDataAvailable ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        )}
        <div className="text-xs">
          <div className="font-semibold text-white">Conversion Tracking Status</div>
          <div className="text-slate-400 mt-0.5">{data?.metrics?.availabilityMessage}</div>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Clicks</span>
            <ArrowUpRight className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white">{data?.metrics?.totalClicks || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Direct outbound clicks</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Conversions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{data?.metrics?.totalConversions || 0}</div>
          <div className="text-xs text-slate-500 mt-1">Verified postback events</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Confirmed Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ₹{(data?.metrics?.confirmedRevenue || 0).toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">Approved commissions</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Conversion Rate</span>
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {(data?.metrics?.conversionRate || 0).toFixed(2)}%
          </div>
          <div className="text-xs text-slate-500 mt-1">Clicks to verified orders</div>
        </div>
      </div>

      {/* Link Health Audit Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Link2 className="w-4 h-4 text-sky-400" />
              Affiliate Link Health Audit
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Auditing active merchant links for valid HTTPS protocol and associate tag parameters.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Auditing merchant links...</div>
        ) : !data?.linkAudit || data.linkAudit.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No price links found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Store</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {data.linkAudit.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-medium text-white">{item.productName}</td>
                    <td className="px-6 py-4 text-slate-400">{item.storeName}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        item.status === 'VALID'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {item.issue || 'Fully compliant & secure HTTPS'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Affiliate Disclosure Compliance Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Affiliate Disclosure Compliance
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Verifying FTC & Advertising Standards disclosure presence across published reviews.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Checking disclosure compliance...</div>
        ) : !data?.disclosureAudit || data.disclosureAudit.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">No published articles found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3">Article</th>
                  <th className="px-6 py-3">Slug</th>
                  <th className="px-6 py-3">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {data.disclosureAudit.map((d: any) => (
                  <tr key={d.blogId} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-medium text-white">{d.title}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">/blog/{d.slug}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        d.status === 'COMPLIANT'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
