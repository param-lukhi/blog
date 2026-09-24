import React from 'react';
import Link from 'next/link';
import { FileText, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions - TechPulse Reviews',
  description: 'Read the terms and conditions governing the use of TechPulse reviews, product guides, and comparison resources.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 font-sans leading-relaxed">
      
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-extrabold uppercase tracking-wide">
          <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Legal Framework</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Terms & Conditions
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Last Updated: September 2026 • Effective Date: January 1, 2024
        </p>
      </div>

      <div className="space-y-10 text-sm sm:text-base">
        
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using TechPulse (the &ldquo;Website&rdquo;), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our website.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
            2. Nature of Service & Editorial Purpose
          </h2>
          <p>
            TechPulse is an independent consumer technology review, comparison, and buying guide website. We synthesize product specifications, user sentiment, and marketplace pricing to provide helpful educational resources for shoppers.
          </p>
          <p>
            TechPulse is <strong>not a direct merchant, manufacturer, or retailer</strong>. We do not sell products directly, process payment transactions, store physical inventory, or handle shipping logistics.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
            3. Intellectual Property Rights
          </h2>
          <p>
            All original editorial content, comparison frameworks, layouts, graphics, and articles on TechPulse are the intellectual property of TechPulse and are protected under international copyright, trademark, and intellectual property laws. You may not republish, reproduce, duplicate, or scrape our articles for commercial redistribution without explicit prior written authorization.
          </p>
        </section>

        <section className="space-y-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-3xl p-6 sm:p-8">
          <h2 className="text-xl font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>4. Product Pricing, Availability & Merchant Transactions</span>
          </h2>
          <p className="text-neutral-700 dark:text-neutral-300 text-sm">
            While we strive for accurate specifications and pricing, merchant prices and inventory change frequently. Any purchase you make is conducted directly on third-party merchant sites (such as Amazon). You are subject to the respective merchant&apos;s terms of service, return policies, and warranties. TechPulse is not liable for merchant pricing discrepancies, shipping delays, or warranty disputes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
            5. Disclaimer of Warranties
          </h2>
          <p>
            All information on TechPulse is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis for informational purposes only. We make no express or implied representations regarding the accuracy, completeness, or suitability of product specifications for any specific commercial or personal purpose.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
            6. Limitation of Liability
          </h2>
          <p>
            In no event shall TechPulse, its editors, or affiliates be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your access to, use of, or inability to use this website or reliance upon any product recommendation.
          </p>
        </section>

        <section className="space-y-3 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
            7. Contact Information
          </h2>
          <p>
            For questions regarding these Terms & Conditions, please contact us via email at <strong>editorial@techpulsereviews.com</strong> or through our{' '}
            <Link href="/contact" className="text-brand-600 dark:text-brand-400 font-bold underline">
              Contact Page
            </Link>.
          </p>
        </section>

      </div>
    </div>
  );
}
