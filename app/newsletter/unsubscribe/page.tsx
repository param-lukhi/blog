'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      handleUnsubscribeByToken(token);
    }
  }, [token]);

  const handleUnsubscribeByToken = async (tok: string) => {
    setStatus('loading');
    try {
      const res = await fetch(`/api/newsletter/unsubscribe?token=${tok}`);
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'You have been successfully unsubscribed.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to unsubscribe.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  const handleManualUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'You have been successfully unsubscribed.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to unsubscribe.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
            Unsubscribe from Newsletter
          </h1>
          <p className="text-xs text-neutral-500">
            We are sorry to see you go. You can unsubscribe with 1 click below.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-8 shadow-soft space-y-6">
          {status === 'success' ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Unsubscribed Successfully
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                {message}
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 text-xs font-bold inline-block"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleManualUnsubscribe} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email to unsubscribe..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {status === 'error' && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
              >
                {status === 'loading' ? 'Processing...' : 'Confirm Unsubscribe'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-16 text-center text-xs text-neutral-400">Loading...</div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
