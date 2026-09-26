import React from 'react';
import {
  ShieldCheck, CheckCircle2, Lock, Scale, DollarSign,
  FileCheck, Users, Eye, HelpCircle, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Editorial Standards & Trust Center — BlogWeb904',
  description: 'Learn how BlogWeb904 researches tech products, verifies multi-store prices, moderates community reviews, and handles user privacy.',
};

export default function TrustCenterPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Editorial Integrity & Transparency
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            BlogWeb904 Trust & Research Standards
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Our mission is to help shoppers make confident buying decisions through verified specifications, honest head-to-head comparisons, and real price tracking. Here is exactly how our platform operates.
          </p>
        </div>

        {/* 6 Core Trust Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-8 shadow-soft space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">
              1. Factual Product Research
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Every product in our catalog begins with documented research. We pull specifications directly from official manufacturer whitepapers, compliance filings, and certified data sheets. We do not invent specs, fabricate battery life, or claim products were tested in laboratory conditions unless documented.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-8 shadow-soft space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">
              2. Authentic Price Verification
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Prices across Amazon, Flipkart, Croma, and official stores are tracked using automated price sync cron adapters and validated against historical price logs. Price drop alerts only trigger when a real price reduction matches your target threshold.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-8 shadow-soft space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">
              3. Objective Comparisons
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              When comparing Product A vs Product B, we evaluate tradeoffs factually (e.g., display brightness, battery endurance, charging speed). We do not declare arbitrary &quot;100% best&quot; winners; instead, we recommend products based on specific user profiles and budgets.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-8 shadow-soft space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">
              4. Community Review Moderation
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              All community reviews are placed in a moderation queue before publishing. We strictly filter spam, promotional abuse, and offensive content. Verified Buyer badges are awarded exclusively when an authenticated purchase or referral conversion is proven.
            </p>
          </div>

          {/* Pillar 5 */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-8 shadow-soft space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">
              5. Transparent Affiliate Disclosure
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              BlogWeb904 earns affiliate commissions from merchant partners when users make qualifying purchases. This comes at zero extra cost to you. We clearly disclose affiliate relationships on every review, price card, and buying guide.
            </p>
          </div>

          {/* Pillar 6 */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-8 shadow-soft space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-lg text-neutral-900 dark:text-white">
              6. Privacy & Data Protection
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              We never sell your email address or personal browsing history. Price alert tokens and newsletter preferences feature unguessable tokens with instant 1-click unsubscribe. IP addresses are hashed using SHA-256 for anonymized analytics.
            </p>
          </div>
        </div>

        {/* Editorial Quality Gate Diagram */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200/80 dark:border-neutral-800 p-8 shadow-soft space-y-6">
          <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
            Our 6-Stage Publishing Workflow
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
            {[
              { step: '1', title: 'Research', desc: 'Official specs' },
              { step: '2', title: 'Verify', desc: 'Fact & price check' },
              { step: '3', title: 'Draft', desc: 'Structured writeup' },
              { step: '4', title: 'Review', desc: 'Editorial quality gate' },
              { step: '5', title: 'Approve', desc: 'Human authorization' },
              { step: '6', title: 'Publish', desc: 'Live & tracked' },
            ].map((st) => (
              <div key={st.step} className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 space-y-1">
                <div className="w-6 h-6 rounded-full bg-brand-600 text-white font-mono font-bold text-xs flex items-center justify-center mx-auto">
                  {st.step}
                </div>
                <div className="font-bold text-xs text-neutral-900 dark:text-white">{st.title}</div>
                <div className="text-[10px] text-neutral-400">{st.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact / Report Link */}
        <div className="text-center space-y-4 pt-4">
          <p className="text-xs text-neutral-500">
            Have questions about our editorial standards or want to report an inaccurate price?
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all"
            >
              Contact Editorial Team
            </Link>
            <Link
              href="/affiliate-disclosure"
              className="px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Read Affiliate Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
