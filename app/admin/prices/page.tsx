'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Clock,
  Filter, Play, ShieldAlert, ArrowUpRight, ArrowDownRight, Search, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface ProductPriceItem {
  id: string;
  productId: string;
  storeName: string;
  storeSlug: string;
  price: number | null;
  originalPrice: number | null;
  currency: string;
  discount: number | null;
  inStock: boolean;
  couponCode?: string | null;
  offerText?: string | null;
  productUrl?: string | null;
  lastCheckedAt: string;
  isStale: boolean;
  status: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    category?: { name: string };
  };
  history?: Array<{
    id: string;
    price: number | null;
    checkedAt: string;
  }>;
}

interface PriceSyncLogItem {
  id: string;
  runId: string;
  storeSlug: string;
  storeName?: string;
  status: 'RUNNING' | 'COMPLETED' | 'PARTIAL' | 'FAILED';
  productsChecked: number;
  productsUpdated: number;
  productsFailed: number;
  errors?: string | null;
  startedAt: string;
  completedAt?: string | null;
}

export default function AdminPricesPage() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [prices, setPrices] = useState<ProductPriceItem[]>([]);
  const [syncLogs, setSyncLogs] = useState<PriceSyncLogItem[]>([]);
  const [summary, setSummary] = useState({ total: 0, fresh: 0, stale: 0 });

  // Filter states
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FRESH' | 'STALE'>('ALL');
  const [storeFilter, setStoreFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Manual verify modal state
  const [verifyingItem, setVerifyingItem] = useState<ProductPriceItem | null>(null);
  const [newPriceVal, setNewPriceVal] = useState('');
  const [newOriginalVal, setNewOriginalVal] = useState('');
  const [newStockVal, setNewStockVal] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [verifyRes, syncRes] = await Promise.all([
        fetch('/api/prices/verify'),
        fetch('/api/prices/sync'),
      ]);

      const verifyData = await verifyRes.json();
      if (verifyData.prices) {
        setPrices(verifyData.prices);
        setSummary(verifyData.summary || { total: 0, fresh: 0, stale: 0 });
      }

      const syncData = await syncRes.json();
      if (syncData.recentSyncs) {
        setSyncLogs(syncData.recentSyncs);
      }
    } catch (err) {
      console.error('Error fetching price data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTriggerSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/prices/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeSlug: storeFilter === 'ALL' ? 'all' : storeFilter }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
      } else {
        alert(data.error || 'Price sync failed');
      }
    } catch (err) {
      alert('Failed to trigger price synchronization');
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveManualVerify = async () => {
    if (!verifyingItem) return;
    try {
      const res = await fetch('/api/prices/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productPriceId: verifyingItem.id,
          newPrice: newPriceVal,
          newOriginalPrice: newOriginalVal,
          inStock: newStockVal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setVerifyingItem(null);
        await fetchData();
      }
    } catch (err) {
      alert('Failed to update verified price');
    }
  };

  const filteredPrices = prices.filter((item) => {
    if (statusFilter === 'FRESH' && item.isStale) return false;
    if (statusFilter === 'STALE' && !item.isStale) return false;
    if (storeFilter !== 'ALL' && item.storeSlug !== storeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = item.product?.name?.toLowerCase() || '';
      const store = item.storeName?.toLowerCase() || '';
      if (!name.includes(q) && !store.includes(q)) return false;
    }
    return true;
  });

  const availableStores = Array.from(new Set(prices.map((p) => p.storeSlug).filter(Boolean)));

  return (
    <div className="space-y-8 pb-16 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 font-extrabold text-xs uppercase tracking-wider mb-1">
            <DollarSign className="w-4 h-4" /> Multi-Store Price Verification & Health Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Price Freshness & Automated Sync Dashboard
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Audit live prices across Amazon, Flipkart, Croma, and Official stores with audit logs and freshness alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleTriggerSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing Store Prices...' : 'Run Automated Price Sync'}</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft">
          <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
            Total Monitored Store Prices
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white">
            {summary.total}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Across all registered multi-store feeds</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 shadow-soft">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
            Fresh & Verified Prices
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {summary.fresh}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Checked within last 7 days</p>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-3xl border border-amber-500/20 bg-amber-500/5 shadow-soft">
          <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1">
            Needs Verification
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {summary.stale}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Older than 7 days threshold</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search product or store..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs outline-none focus:border-emerald-500 w-full sm:w-64"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('FRESH')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'FRESH'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Fresh ({summary.fresh})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('STALE')}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === 'STALE'
                  ? 'bg-amber-500 text-neutral-950 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Needs Verification ({summary.stale})
            </button>
          </div>

          {/* Store Filter */}
          <select
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
            className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-200 outline-none cursor-pointer"
          >
            <option value="ALL">All Stores</option>
            {availableStores.map((slug) => (
              <option key={slug} value={slug}>
                {slug.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Prices Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
            Monitored Product Prices ({filteredPrices.length})
          </h3>
          <span className="text-[11px] text-neutral-400">
            Click &apos;Verify Price&apos; to manually adjust or check live store
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 font-bold uppercase text-[10px] tracking-wider border-b border-neutral-100 dark:border-neutral-800">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Store</th>
                <th className="py-3 px-4">Current Price</th>
                <th className="py-3 px-4">MRP / Discount</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Last Checked</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredPrices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-neutral-400 text-xs">
                    No prices found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredPrices.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white max-w-xs truncate">
                      {item.product ? (
                        <Link
                          href={`/product/${item.product.slug}`}
                          target="_blank"
                          className="hover:text-brand-600 flex items-center gap-1"
                        >
                          <span className="truncate">{item.product.name}</span>
                          <ExternalLink className="w-3 h-3 text-neutral-400 shrink-0" />
                        </Link>
                      ) : (
                        'Unknown Product'
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 font-bold text-[11px] text-neutral-700 dark:text-neutral-300 uppercase">
                        {item.storeName || item.storeSlug}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      {item.price !== null && item.price !== undefined ? `₹${item.price.toLocaleString()}` : 'Check price'}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500">
                      {item.originalPrice ? (
                        <span className="line-through text-[11px]">₹{item.originalPrice.toLocaleString()}</span>
                      ) : (
                        '-'
                      )}
                      {item.discount ? (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px]">
                          {item.discount}% OFF
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.inStock
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}>
                        {item.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400 text-[11px] font-mono">
                      {item.lastCheckedAt ? new Date(item.lastCheckedAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                        item.isStale
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setVerifyingItem(item);
                          setNewPriceVal(item.price ? String(item.price) : '');
                          setNewOriginalVal(item.originalPrice ? String(item.originalPrice) : '');
                          setNewStockVal(item.inStock);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-[11px] transition-all cursor-pointer"
                      >
                        Verify / Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Automated Sync Audit Logs Section (PART 9) */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
              Automated Price Synchronization Audit Logs
            </h3>
            <p className="text-[11px] text-neutral-400">
              Run ID, timestamps, products updated, partial failure metrics, and status
            </p>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            Last {syncLogs.length} runs recorded
          </span>
        </div>

        {syncLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            No automated sync runs logged yet. Click &apos;Run Automated Price Sync&apos; to execute the first scheduled batch.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {syncLogs.map((log) => (
              <div key={log.id} className="py-3.5 flex items-center justify-between gap-4 flex-wrap text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-900 dark:text-white">
                      {log.runId}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                      log.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : log.status === 'PARTIAL'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {log.status}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] text-neutral-600 dark:text-neutral-400 font-bold uppercase">
                      {log.storeSlug}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Checked: <strong>{log.productsChecked}</strong> | Updated: <strong>{log.productsUpdated}</strong> | Failed: <strong>{log.productsFailed}</strong>
                  </div>
                </div>

                <div className="text-right text-[11px] text-neutral-400 font-mono">
                  <div>Started: {new Date(log.startedAt).toLocaleString()}</div>
                  {log.completedAt && (
                    <div>Completed: {new Date(log.completedAt).toLocaleTimeString()}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Verification Modal */}
      {verifyingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">
                Verify Price for {verifyingItem.storeName}
              </h3>
              <button
                type="button"
                onClick={() => setVerifyingItem(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              Product: <strong>{verifyingItem.product?.name}</strong>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Verified Price (₹)
                </label>
                <input
                  type="number"
                  value={newPriceVal}
                  onChange={(e) => setNewPriceVal(e.target.value)}
                  placeholder="e.g. 24999"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Original Price / MRP (₹)
                </label>
                <input
                  type="number"
                  value={newOriginalVal}
                  onChange={(e) => setNewOriginalVal(e.target.value)}
                  placeholder="e.g. 29999"
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={newStockVal}
                    onChange={(e) => setNewStockVal(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 cursor-pointer"
                  />
                  <span>In Stock</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setVerifyingItem(null)}
                className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveManualVerify}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs"
              >
                Save &amp; Log Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
