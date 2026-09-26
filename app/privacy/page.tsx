import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Cookie, Eye, ExternalLink, Mail, CheckCircle2 } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - BlogWeb904 Reviews',
  description: 'Learn how BlogWeb904 handles data, cookies, Google AdSense advertising, and user privacy in compliance with global standards.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 font-sans leading-relaxed">
      
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-extrabold uppercase tracking-wide">
          <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Trust & Transparency</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Privacy Policy & Cookie Statement
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Last Updated: September 2026 • Effective Date: January 1, 2024
        </p>
      </div>

      {/* Intro Summary Box */}
      <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white text-base">
          <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>Our Privacy Commitment</span>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          At BlogWeb904 (accessible via <strong>https://blogweb904.vercel.app</strong>), the privacy of our visitors is of utmost importance to us. This Privacy Policy document outlines the types of personal information that is received and collected by BlogWeb904 and how it is utilized, including our strict compliance with Google AdSense publisher policies, GDPR, and CCPA standards.
        </p>
      </div>

      <div className="space-y-10 text-sm sm:text-base">
        
        {/* Section 1: Information We Collect */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>1. Information We Collect</span>
          </h2>
          <p>
            BlogWeb904 is an editorial research and buying guide website. We do not require visitors to register an account or provide financial billing information to read our reviews and guides.
          </p>
          <ul className="space-y-2 list-disc pl-5 text-neutral-700 dark:text-neutral-300">
            <li>
              <strong>Voluntarily Provided Information:</strong> When you subscribe to our newsletter or submit an inquiry through our Contact Us form, you may provide your name and email address. We use this data exclusively to respond to your inquiry or deliver editorial emails.
            </li>
            <li>
              <strong>Log Files:</strong> Like most standard web servers, BlogWeb904 uses log files. These files log visits to the website. Information stored includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date/time stamps, referring/exit pages, and number of clicks. This information is anonymous and not linked to personally identifiable information.
            </li>
          </ul>
        </section>

        {/* Section 2: Google AdSense & Third-Party Advertising */}
        <section className="space-y-4 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900/50 rounded-3xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-900 dark:text-brand-300 flex items-center gap-2">
            <Eye className="w-6 h-6 text-brand-600 dark:text-brand-400 shrink-0" />
            <span>2. Google AdSense & Third-Party Advertising Disclosures</span>
          </h2>
          <p className="text-neutral-800 dark:text-neutral-200 font-medium">
            Third-party vendors, including <strong>Google</strong>, use cookies to serve advertisements based on a user&apos;s prior visits to BlogWeb904 or other websites across the Internet.
          </p>
          <div className="space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
            <p>
              • <strong>Google DoubleClick Cookie:</strong> Google&apos;s use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site and/or other sites on the Internet.
            </p>
            <p>
              • <strong>Personalized Advertising Opt-Out:</strong> Users may opt out of personalized advertising by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 dark:text-brand-400 font-bold underline inline-flex items-center gap-1"
              >
                Google Ads Settings <ExternalLink className="w-3 h-3" />
              </a>.
            </p>
            <p>
              • Alternatively, users can opt out of third-party vendor use of cookies for personalized advertising by visiting{' '}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 dark:text-brand-400 font-bold underline inline-flex items-center gap-1"
              >
                AboutAds.info Choices <ExternalLink className="w-3 h-3" />
              </a>{' '}
              or the Network Advertising Initiative opt-out page at{' '}
              <a
                href="https://optout.networkadvertising.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 dark:text-brand-400 font-bold underline inline-flex items-center gap-1"
              >
                Network Advertising Initiative <ExternalLink className="w-3 h-3" />
              </a>.
            </p>
          </div>
        </section>

        {/* Section 3: Amazon Associates & Affiliate Cookies */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <Cookie className="w-6 h-6 text-amber-500 shrink-0" />
            <span>3. Amazon Associates & Affiliate Tracking Cookies</span>
          </h2>
          <p>
            BlogWeb904 is a participant in the Amazon Services LLC Associates Program and regional Amazon affiliate programs worldwide. When you click on outgoing Amazon product links on our site, Amazon places an HTTP tracking cookie on your device to attribute referral sales and calculate qualifying commissions.
          </p>
          <p>
            These affiliate cookies do not collect sensitive personal data such as your name, address, or credit card details. You can review Amazon&apos;s privacy policy on official Amazon portals.
          </p>
        </section>

        {/* Section 4: Web Analytics */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
            4. Analytics Services
          </h2>
          <p>
            We may use privacy-conscious analytics tools (such as Google Analytics) to monitor aggregate traffic patterns, popular articles, and user engagement. These tools collect anonymized information such as device category, approximate geographical region, and session duration to help us create higher quality editorial content.
          </p>
        </section>

        {/* Section 5: GDPR & Data Protection Rights */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
            5. GDPR & CCPA Data Protection Rights
          </h2>
          <p>
            Depending on your location, you have certain rights under data protection laws (including the General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA)):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Right to Access & Portability</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">You may request copies of any personal data we hold about you (e.g. newsletter email records).</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Right to Erasure (&quot;Right to be Forgotten&quot;)</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">You can request that we delete your email address from our database at any time.</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Right to Opt-Out of Sale</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">BlogWeb904 does not sell personal user data to third parties for monetary consideration.</p>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <h4 className="font-bold text-neutral-900 dark:text-white mb-1">Right to Non-Discrimination</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">We will never discriminate against you for exercising any of your privacy rights.</p>
            </div>
          </div>
        </section>

        {/* Section 6: Children's Information */}
        <section className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
            6. Children&apos;s Information (COPPA)
          </h2>
          <p>
            Protecting children while using the internet is especially important to us. BlogWeb904 does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you believe your child has provided personal information on our website, please contact us immediately and we will promptly remove such information.
          </p>
        </section>

        {/* Section 7: Contact Us for Privacy Matters */}
        <section className="space-y-4 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-brand-600" />
            <span>7. Contact Our Privacy Officer</span>
          </h2>
          <p>
            If you have questions about this Privacy Policy, your rights, or wish to make a data request, please contact our editorial and privacy desk:
          </p>
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1 text-sm">
            <p className="font-bold text-neutral-900 dark:text-white">BlogWeb904 Editorial & Privacy Desk</p>
            <p className="text-neutral-600 dark:text-neutral-400">Email: <strong>editorial@blogweb904.vercel.app</strong></p>
            <p className="text-neutral-600 dark:text-neutral-400">
              Or submit a ticket via our{' '}
              <Link href="/contact" className="text-brand-600 dark:text-brand-400 font-bold underline">
                Contact Page
              </Link>.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
