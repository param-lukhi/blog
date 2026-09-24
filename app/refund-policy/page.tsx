import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ShieldCheck, ExternalLink, HelpCircle } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy & Merchant Purchases - TechPulse Reviews',
  description: 'Learn how product refunds, customer returns, and merchant warranty claims work for products purchased via TechPulse affiliate links.',
  alternates: {
    canonical: '/refund-policy',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 font-sans leading-relaxed">
      
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-extrabold uppercase tracking-wide">
          <ShoppingBag className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Merchant Fulfillment Notice</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Refund Policy & Merchant Order Returns
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Last Updated: September 2026
        </p>
      </div>

      <div className="space-y-8 text-sm sm:text-base">
        
        <div className="bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/60 rounded-3xl p-6 sm:p-8 space-y-3">
          <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 font-bold text-base">
            <ShieldCheck className="w-5 h-5" />
            <span>Important Notice Regarding Purchases</span>
          </div>
          <p className="text-neutral-700 dark:text-neutral-300 text-sm">
            TechPulse is an independent review, comparison, and product research publication. We do not sell products directly, collect payment details, or fulfill orders. All purchases made through our referral links are transacted directly on <strong>Amazon</strong> or other authorized merchant storefronts.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
            1. Amazon 30-Day Return Policy
          </h2>
          <p>
            When you purchase an item via a link on TechPulse, your order is backed by the respective Amazon marketplace return and refund policy (typically offering a 30-day window for returns, replacements, or full refunds on eligible items).
          </p>
          <p>
            To initiate a return or request a refund for an item you bought on Amazon:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            <li>Log into your Amazon account where the purchase was made.</li>
            <li>Navigate to <strong>&ldquo;Returns &amp; Orders&rdquo;</strong> in the top menu.</li>
            <li>Locate the specific product order and click <strong>&ldquo;Return or replace items&rdquo;</strong>.</li>
            <li>Select the reason for return and choose your preferred refund method (original payment method or Amazon Gift Card balance).</li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
            2. Manufacturer Warranties & Product Support
          </h2>
          <p>
            Brand warranties (e.g. AppleCare, Sony 1-Year Limited Warranty, Samsung Care) are administered directly by the respective device manufacturer. Please register your device or keep your Amazon purchase invoice handy for warranty claims.
          </p>
        </section>

        <section className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-600" />
            <span>Need Further Assistance?</span>
          </h2>
          <p>
            If you have questions about a review or buying guide published on TechPulse, feel free to contact our editorial team via our{' '}
            <Link href="/contact" className="text-brand-600 dark:text-brand-400 font-bold underline">
              Contact Page
            </Link>. For questions regarding an active Amazon order or shipment, please contact Amazon Customer Service directly.
          </p>
        </section>

      </div>
    </div>
  );
}
