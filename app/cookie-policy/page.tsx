import React from 'react';
import Link from 'next/link';
import { Cookie, ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - TechPulse Reviews',
  description: 'Understand how cookies are used on TechPulse for site preferences, Google AdSense advertising, and affiliate attribution.',
  alternates: {
    canonical: '/cookie-policy',
  },
};

export default function CookiePolicyPage() {
  const cookieCategories = [
    {
      title: '1. Strictly Necessary Cookies',
      desc: 'These cookies are essential for website operation, such as remembering your dark mode/light mode theme selection and active user sessions.',
      purpose: 'Core site layout and display functionality.',
      lifespan: 'Session to 1 Year',
    },
    {
      title: '2. Google AdSense Advertising Cookies',
      desc: 'Google uses cookies (including the DoubleClick cookie) to serve advertisements based on your visits to our site and other internet locations. You can opt out at any time via Google Ads Settings.',
      purpose: 'Ad personalization, frequency capping, and ad reporting.',
      lifespan: '90 days to 2 Years',
    },
    {
      title: '3. Amazon Associates Affiliate Cookies',
      desc: 'When you click a merchant link to Amazon, a tracking cookie is placed by Amazon to record referral qualifying purchases.',
      purpose: 'Affiliate commission tracking at zero additional cost to the shopper.',
      lifespan: '24 Hours (Standard Qualifying Window)',
    },
    {
      title: '4. Analytics & Performance Cookies',
      desc: 'Anonymized analytics cookies help us measure aggregate visitor numbers, popular product categories, and guide readability.',
      purpose: 'Editorial research & content optimization.',
      lifespan: '1 to 2 Years',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 font-sans leading-relaxed">
      
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-extrabold uppercase tracking-wide">
          <Cookie className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Transparency</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Cookie Policy
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Last Updated: September 2026 • Effective Date: January 1, 2024
        </p>
      </div>

      <div className="space-y-10 text-sm sm:text-base">
        <section className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
            What Are Cookies?
          </h2>
          <p>
            Cookies are small text files placed on your computer or mobile device when you visit a website. They are widely used to make websites work properly, provide a personalized user experience, and supply statistical or advertising data to site owners.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
            Types of Cookies We Use
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {cookieCategories.map((c, idx) => (
              <div
                key={idx}
                className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                    {c.title}
                  </h3>
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                    Lifespan: {c.lifespan}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                  {c.desc}
                </p>
                <div className="pt-2 text-xs text-neutral-500 flex items-center gap-1">
                  <span className="font-bold text-neutral-700 dark:text-neutral-300">Purpose:</span> {c.purpose}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3 bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900/50 rounded-3xl p-6 sm:p-8">
          <h2 className="text-xl font-extrabold text-brand-900 dark:text-brand-300">
            How to Control or Opt Out of Cookies
          </h2>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">
            You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you can still use our website, though some preferences (like dark mode or saved wishlists) may not persist across visits.
          </p>
          <div className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300 pt-2">
            <p>
              • <strong>Google Ad Personalization Opt-Out:</strong>{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 dark:text-brand-400 font-bold underline inline-flex items-center gap-1"
              >
                Google Ads Settings <ExternalLink className="w-3 h-3" />
              </a>
            </p>
            <p>
              • <strong>Industry-wide Opt-Out:</strong>{' '}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 dark:text-brand-400 font-bold underline inline-flex items-center gap-1"
              >
                Digital Advertising Alliance (DAA) <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </section>

        <section className="space-y-3 pt-6 border-t border-neutral-200 dark:border-neutral-800">
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
            Questions About Our Cookie Practices?
          </h2>
          <p>
            If you have questions regarding our cookie disclosures, please reach out via our{' '}
            <Link href="/contact" className="text-brand-600 dark:text-brand-400 font-bold underline">
              Contact Page
            </Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
