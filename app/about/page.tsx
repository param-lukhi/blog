import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Search, Scale, FileText, CheckCircle2, HelpCircle, User, Award, Mail, ArrowRight } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About BlogWeb904 - Editorial Mission, Author Profile & Research Methodology',
  description: 'Meet the team behind BlogWeb904. Learn how we research tech specifications, evaluate buyer feedback, and create unbiased buying guides.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  const methodologySteps = [
    {
      title: '1. Market & Product Selection',
      desc: 'We monitor new device launches, hardware updates, and high-demand consumer electronics to identify products where shoppers need clear guidance.',
    },
    {
      title: '2. Specification Deconstruction',
      desc: 'We break down complex technical spec sheets (CPU architecture, display nits, battery watt-hours, camera sensors) into clear real-world explanations.',
    },
    {
      title: '3. Verified Buyer Sentiment Synthesis',
      desc: 'We aggregate and analyze thousands of authentic buyer reviews across regional marketplaces to identify recurring long-term reliability issues and strengths.',
    },
    {
      title: '4. Direct Side-by-Side Comparison',
      desc: 'We benchmark alternative devices in the same price tier to highlight where a device excels and where a competitor offers better value.',
    },
    {
      title: '5. Balanced Pros, Cons & Suitability Verdicts',
      desc: 'Every review includes explicit "Who Should Buy" and "Who Should Avoid" criteria so you never spend money on features you do not need.',
    },
    {
      title: '6. Price Tracking & Marketplace Availability',
      desc: 'We monitor official Amazon catalog pricing and promotions to ensure you get current, relevant buying links without inflated pricing claims.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 font-sans leading-relaxed">
      
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <span className="text-xs uppercase font-extrabold tracking-wider text-brand-600 dark:text-brand-400 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950">
          <ShieldCheck className="w-4 h-4" />
          <span>Editorial Independence & Mission</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          About BlogWeb904 Reviews
        </h1>
        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
          We research product specifications, market pricing, user sentiment, and hardware features to help everyday shoppers make informed, confident buying decisions.
        </p>
      </div>

      {/* Founder & Lead Editor Profile */}
      <section className="bg-neutral-50 dark:bg-neutral-900 rounded-3xl p-6 sm:p-10 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-neutral-900 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-brand-500/20 shrink-0">
            P
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
                Param Lukhi
              </h2>
              <span className="text-xs font-bold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
                Founder &amp; Lead Tech Editor
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              Technology enthusiast, full-stack software developer, and consumer electronics researcher dedicated to demystifying technical jargon and helping readers find the best gadgets within their budget.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3 text-sm text-neutral-700 dark:text-neutral-300">
          <h3 className="font-bold text-neutral-900 dark:text-white text-sm uppercase tracking-wider">
            Our Editorial Approach &amp; Commitment
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed">
            &ldquo;As someone who loves consumer technology, I started BlogWeb904 to solve a common problem: product reviews on the web are often filled with sponsored bias, exaggerated claims, or generic marketing copy. Our editorial process is straightforward: we perform deep research, analyze verified user feedback across thousands of owners, evaluate real-world trade-offs, and lay out the facts clearly.&rdquo;
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-brand-600 dark:text-brand-400 font-bold">
            <Link href="/contact" className="hover:underline flex items-center gap-1">
              <span>Contact Editorial Team</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link href="/affiliate-disclosure" className="hover:underline flex items-center gap-1">
              <span>View Affiliate Disclosure</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            Core Editorial Principles
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            How we protect our readers and uphold high content standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
            <Search className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            <h3 className="font-bold text-neutral-900 dark:text-white text-base">In-Depth Research</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              We scrutinize technical spec sheets, benchmark data, and verified customer experiences to deliver authentic evaluations.
            </p>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
            <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-neutral-900 dark:text-white text-base">Editorial Independence</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Brands cannot buy higher review ratings or alter our editorial conclusions. Our loyalty is 100% to our readers.
            </p>
          </div>

          <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-3">
            <Scale className="w-7 h-7 text-amber-500" />
            <h3 className="font-bold text-neutral-900 dark:text-white text-base">Transparent Comparisons</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              We highlight direct pros, cons, and alternatives so you can find the best match for your specific lifestyle and budget.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Methodology Section */}
      <section className="space-y-6">
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            Our 6-Step Research Methodology
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            How every product review and buying guide on TechPulse is formulated.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {methodologySteps.map((step, idx) => (
            <div key={idx} className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-2">
              <h3 className="font-bold text-neutral-900 dark:text-white text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                <span>{step.title}</span>
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pl-6">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Honest Distinction Box */}
      <div className="bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900/50 rounded-2xl p-6 sm:p-8 space-y-3">
        <h3 className="font-bold text-brand-900 dark:text-brand-300 text-sm flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Transparency: Research-Based Reviews vs Physical Benchmarking</span>
        </h3>
        <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
          At TechPulse, honesty is our foundation. Unless an article explicitly states that physical hardware was tested hands-on by our editorial team, our articles represent <strong>deep research-driven buying guides</strong> synthesized from official manufacturer specifications, authenticated buyer experiences, and regional pricing data. We never fabricate physical testing or pretend to own products we haven&apos;t evaluated.
        </p>
      </div>

    </div>
  );
}
