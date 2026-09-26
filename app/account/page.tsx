'use client';

import React, { useState, useEffect } from 'react';
import {
  User, Bookmark, Bell, Mail, Trash2, ExternalLink,
  Tag, Scale, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface SavedProduct {
  id: string;
  name: string;
  slug: string;
  price: string;
  brand: string;
  image?: string;
  savedAt: string;
}

interface SavedComparison {
  slug: string;
  title: string;
  savedAt: string;
}

export default function UserAccountPage() {
  const [activeTab, setActiveTab] = useState<'saved' | 'comparisons' | 'alerts' | 'newsletter'>('saved');
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [savedComparisons, setSavedComparisons] = useState<SavedComparison[]>([]);

  // Price Alert Lookup by Email
  const [lookupEmail, setLookupEmail] = useState('');
  const [userAlerts, setUserAlerts] = useState<any[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Load from localStorage on client mount
  useEffect(() => {
    try {
      const prods = localStorage.getItem('blogweb904_saved_products');
      if (prods) setSavedProducts(JSON.parse(prods));

      const comps = localStorage.getItem('blogweb904_saved_comparisons');
      if (comps) setSavedComparisons(JSON.parse(comps));

      const savedEmail = localStorage.getItem('blogweb904_user_email');
      if (savedEmail) {
        setLookupEmail(savedEmail);
        fetchUserAlerts(savedEmail);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const removeProduct = (id: string) => {
    const updated = savedProducts.filter((p) => p.id !== id);
    setSavedProducts(updated);
    localStorage.setItem('blogweb904_saved_products', JSON.stringify(updated));
  };

  const removeComparison = (slug: string) => {
    const updated = savedComparisons.filter((c) => c.slug !== slug);
    setSavedComparisons(updated);
    localStorage.setItem('blogweb904_saved_comparisons', JSON.stringify(updated));
  };

  const fetchUserAlerts = async (emailToLookup = lookupEmail) => {
    if (!emailToLookup || !emailToLookup.includes('@')) return;
    setLoadingAlerts(true);
    setAlertMessage('');
    try {
      const res = await fetch(`/api/prices/alerts?email=${encodeURIComponent(emailToLookup)}`);
      const data = await res.json();
      if (data.success) {
        setUserAlerts(data.alerts || []);
        localStorage.setItem('blogweb904_user_email', emailToLookup);
      } else {
        setAlertMessage(data.error || 'No active alerts found.');
      }
    } catch {
      setAlertMessage('Failed to load price alerts.');
    } finally {
      setLoadingAlerts(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-600 font-extrabold text-xs uppercase tracking-wider mb-1">
              <User className="w-4 h-4" /> Personal Research Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              My Saved Products & Price Watchlist
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Manage your bookmarked product reviews, saved comparisons, and active verified price drop alerts.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'saved'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Products ({savedProducts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('comparisons')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'comparisons'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Saved Comparisons ({savedComparisons.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'alerts'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Price Drop Alerts ({userAlerts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('newsletter')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'newsletter'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Newsletter Preferences</span>
          </button>
        </div>

        {/* Tab 1: Saved Products */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            {savedProducts.length === 0 ? (
              <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center space-y-4">
                <Bookmark className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto" />
                <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                  No saved products yet
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Click the &quot;Save Product&quot; button on any product page or review to quickly reference specs and prices later.
                </p>
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold inline-block hover:bg-brand-700"
                >
                  Explore Products & Reviews
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {savedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 uppercase">
                        <span>{p.brand}</span>
                        <button
                          onClick={() => removeProduct(p.id)}
                          className="text-neutral-400 hover:text-rose-500"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white mt-1 line-clamp-2">
                        {p.name}
                      </h4>
                      <div className="text-sm font-extrabold text-brand-600 mt-2">{p.price}</div>
                    </div>
                    <Link
                      href={`/products/${p.slug}`}
                      className="px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white text-xs font-bold text-center block transition-all"
                    >
                      View Live Specs & Prices
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Saved Comparisons */}
        {activeTab === 'comparisons' && (
          <div className="space-y-4">
            {savedComparisons.length === 0 ? (
              <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-12 text-center space-y-4">
                <Scale className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto" />
                <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                  No saved comparisons yet
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Compare two products head-to-head and save them to this list for quick reference.
                </p>
                <Link
                  href="/comparisons"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold inline-block hover:bg-brand-700"
                >
                  Browse Head-to-Head Comparisons
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedComparisons.map((c) => (
                  <div
                    key={c.slug}
                    className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-5 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                        {c.title}
                      </h4>
                      <span className="text-[10px] text-neutral-400">
                        Saved on {new Date(c.savedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/comparisons/${c.slug}`}
                        className="p-2 rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 text-xs font-bold"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => removeComparison(c.slug)}
                        className="p-2 text-neutral-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Price Alerts */}
        {activeTab === 'alerts' && (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
                  My Active Price Drop Alerts
                </h3>
                <p className="text-xs text-neutral-500">
                  Enter the email address you used to set up price alerts to manage them.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Enter your alert email..."
                  value={lookupEmail}
                  onChange={(e) => setLookupEmail(e.target.value)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => fetchUserAlerts()}
                  disabled={loadingAlerts}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all"
                >
                  {loadingAlerts ? 'Checking...' : 'Lookup Alerts'}
                </button>
              </div>
            </div>

            {alertMessage && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 text-xs">
                {alertMessage}
              </div>
            )}

            {userAlerts.length > 0 ? (
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {userAlerts.map((alert) => (
                  <div key={alert.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-neutral-900 dark:text-white">
                        {alert.productName || 'Verified Product'}
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Target Price: <strong className="text-emerald-600">₹{alert.targetPrice}</strong> ({alert.storeSlug})
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 text-[10px] font-bold">
                        {alert.status}
                      </span>
                      {alert.token && (
                        <a
                          href={`/api/prices/alerts/unsubscribe?token=${alert.token}`}
                          className="text-rose-500 hover:underline text-[11px]"
                        >
                          Cancel Alert
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-neutral-400">
                No active price alerts found for this email address.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Newsletter Preferences */}
        {activeTab === 'newsletter' && (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft p-6 sm:p-8 space-y-6">
            <h3 className="font-extrabold text-base text-neutral-900 dark:text-white">
              Newsletter & Digest Subscriptions
            </h3>
            <p className="text-xs text-neutral-500">
              You can subscribe or update your topic preferences at any time.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/newsletter"
                className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700"
              >
                Manage Newsletter Preferences
              </Link>
              <Link
                href="/newsletter/unsubscribe"
                className="px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                1-Click Unsubscribe
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
