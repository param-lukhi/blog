'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, ShieldCheck, Sparkles, Tag, Scale, Newspaper } from 'lucide-react';
import Link from 'next/link';

export default function PublicNewsletterPage() {
  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState<string[]>(['reviews', 'drops', 'comparisons', 'digest']);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const togglePref = (pref: string) => {
    if (preferences.includes(pref)) {
      setPreferences(preferences.filter((p) => p !== pref));
    } else {
      setPreferences([...preferences, pref]);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, preferences }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Thank you for subscribing! You will receive our verified product digests.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Subscription failed. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-extrabold uppercase tracking-wider">
            <Mail className="w-4 h-4" /> Editorial Newsletter
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Stay Ahead on Tech Buying & Verified Deals
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Join thousands of smart shoppers. Get unbiased product research, price drop alerts, and weekly buying guides delivered straight to your inbox.
          </p>
        </div>

        {/* Subscription Card */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft p-8 space-y-6">
          {status === 'success' ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">You&apos;re Subscribed!</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                {message}
              </p>
              <div className="pt-4">
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-all inline-block"
                >
                  Return to Home & Explore Reviews
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Your Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              {/* Preferences Checklist */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Select What You Want to Receive:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'reviews', label: 'New Product Reviews', desc: 'In-depth factual buying guides', icon: Newspaper },
                    { id: 'drops', label: 'Verified Price Drops', desc: 'Target price alerts & deals', icon: Tag },
                    { id: 'comparisons', label: 'Head-to-Head Comparisons', desc: 'Detailed spec showdowns', icon: Scale },
                    { id: 'digest', label: 'Weekly Summary Digest', desc: 'Top tech highlights of the week', icon: Sparkles },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isChecked = preferences.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => togglePref(item.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                          isChecked
                            ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-neutral-900 dark:text-white ring-1 ring-brand-500/20'
                            : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-xs">{item.label}</div>
                          <div className="text-[10px] text-neutral-400">{item.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {status === 'error' && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe to Free Updates'}
              </button>
            </form>
          )}

          {/* Privacy & Anti-Spam Badge */}
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Zero spam. We respect your inbox privacy.</span>
            </div>
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
