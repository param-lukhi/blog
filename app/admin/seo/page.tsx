'use client';

import React, { useState } from 'react';
import { ShieldCheck, Globe, CheckCircle2, RefreshCw, FileCode, Check } from 'lucide-react';

export default function AdminSEOPage() {
  const [sitemapStatus, setSitemapStatus] = useState('Generated & Dynamic (/sitemap.xml)');
  const [robotsStatus, setRobotsStatus] = useState('Active (/robots.txt)');

  return (
    <div className="space-y-8 pb-16 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 text-emerald-500 font-extrabold text-xs uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" /> Search Engine Optimization
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          SEO Control Center & Indexing Status
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Manage meta tag defaults, JSON-LD structured schema markup, and automatic sitemap generation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft space-y-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider">XML Sitemap Status</span>
            <Globe className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-extrabold text-neutral-900 dark:text-white">{sitemapStatus}</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Automatically indexes all published blogs & products
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft space-y-3">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-bold uppercase tracking-wider">Robots.txt Configuration</span>
            <FileCode className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-lg font-extrabold text-neutral-900 dark:text-white">{robotsStatus}</div>
          <div className="text-[11px] text-brand-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Blocks /admin/* crawlers while allowing Googlebot
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 shadow-soft space-y-4">
        <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white">Global Meta Tag Defaults</h3>
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Site Meta Title Pattern</label>
            <input
              type="text"
              defaultValue="%s | TechPulse Reviews"
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Default Meta Description</label>
            <textarea
              rows={3}
              defaultValue="TechPulse Reviews brings you comprehensive research-based product reviews, specification breakdowns, and curated buying guides."
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
