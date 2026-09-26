import React from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw, Home, Bookmark } from 'lucide-react';

export const metadata = {
  title: 'Offline — BlogWeb904',
  description: 'You are currently offline. Please check your internet connection.',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft">
        <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 flex items-center justify-center mx-auto">
          <WifiOff className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            You&apos;re Currently Offline
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            It looks like your internet connection was interrupted. You can still access previously saved articles and products from your local storage.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/account"
            className="px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all inline-flex items-center justify-center gap-2"
          >
            <Bookmark className="w-4 h-4" />
            <span>View Saved</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
