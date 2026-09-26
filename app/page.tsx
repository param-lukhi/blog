import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import BlogCard from '@/components/BlogCard';
import CategoryCard from '@/components/CategoryCard';
import FaqAccordion from '@/components/FaqAccordion';
import {
  Sparkles, ArrowRight, ShieldCheck, Zap, Award, Flame,
  Scale, CheckCircle2, BookOpen, Layers, Search, PlusCircle,
  TrendingUp, Compass, Star, ExternalLink, Cpu
} from 'lucide-react';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'BlogWeb904 - Research-Based Tech Reviews & Unbiased Buying Guides',
  description: 'In-depth research-based product reviews, hardware comparisons, multi-store price comparisons, and buying guides to help consumers make smart purchasing decisions.',
  alternates: {
    canonical: '/',
  },
};

async function getData() {
  const categories = await db.category.findMany({ take: 16, orderBy: { name: 'asc' } });
  const featuredProducts = await db.product.findMany({
    where: { status: 'PUBLISHED', isFeatured: true },
    include: { category: true },
    take: 4,
  });
  const trendingProducts = await db.product.findMany({
    where: { status: 'PUBLISHED', isTrending: true },
    include: { category: true },
    take: 4,
  });
  const dealProducts = await db.product.findMany({
    where: { status: 'PUBLISHED', isDeal: true },
    include: { category: true },
    take: 4,
  });
  const latestBlogs = await db.blog.findMany({
    where: { status: 'PUBLISHED' },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });

  const settingsList = await db.setting.findMany();
  const settings: Record<string, string> = {};
  settingsList.forEach((s) => {
    settings[s.key] = s.value;
  });

  return {
    categories,
    featuredProducts,
    trendingProducts,
    dealProducts,
    latestBlogs,
    settings,
  };
}

export default async function HomePage() {
  const { categories, featuredProducts, trendingProducts, dealProducts, latestBlogs, settings } = await getData();

  const heroTitle = settings.hero_title || 'Research-Based Tech Reviews & Buying Guides';
  const heroSubtitle = settings.hero_subtitle || 'We research technical specifications, marketplace pricing, verified buyer feedback, and hardware features to help you make smarter purchasing decisions.';
  const heroButtonText = settings.hero_button_text || 'Explore Reviews';

  const popularKeywords = ['Laptops', 'Smartphones', 'Noise Canceling', 'Smart Watches', 'OLED TVs', 'Gaming Gear'];

  const homeFaqs = [
    {
      question: 'How does TechPulse research and evaluate tech products?',
      answer: 'Our editorial team analyzes official technical specifications, benchmark data, verified buyer sentiment across thousands of owners, long-term build quality data, and price-to-performance metrics to formulate balanced, research-driven buying guides and reviews.',
    },
    {
      question: 'How are product prices and deals determined?',
      answer: 'We research and track official Amazon catalog prices and regional marketplace promotions. Because merchant prices fluctuate regularly, always verify final pricing and warranty details directly on Amazon at checkout.',
    },
    {
      question: 'Does TechPulse accept paid sponsorships for review scores?',
      answer: 'No. We maintain strict editorial independence. Brand sponsorships or affiliate relationships never dictate our ratings, product selection, or review conclusions.',
    },
    {
      question: 'What is TechPulse’s policy on affiliate links?',
      answer: 'We may earn a small referral commission when you purchase through our links on Amazon at zero extra cost to you. Affiliate partnerships never influence our pros, cons, or product rankings.',
    },
  ];

  return (
    <div className="space-y-16 pb-20 bg-neutral-50/50 dark:bg-[#0b0f17]">
      
      {/* 1. Hero Section with Aurora Ambient Glow & Interactive Quick Filters */}
      <section className="relative overflow-hidden bg-[#0a0e1a] text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-neutral-800/80">
        {/* Dynamic Aurora Glow Orbs */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-blue-600/25 via-indigo-500/20 to-purple-600/25 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-7">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 border border-blue-400/30 text-blue-300 text-xs font-extrabold uppercase tracking-widest backdrop-blur-md shadow-lg shadow-blue-500/10 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>100% Unbiased Tech Research &amp; Buying Guides</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] max-w-4xl mx-auto">
            {heroTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed font-normal">
            {heroSubtitle}
          </p>

          {/* Quick Search Chips */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-bold text-neutral-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" /> Popular:
            </span>
            {popularKeywords.map((kw) => (
              <Link
                key={kw}
                href={`/search?q=${encodeURIComponent(kw)}`}
                className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white border border-white/10 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {kw}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#explore-categories"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm transition-all duration-200 shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>{heroButtonText}</span>
            </Link>

            <Link
              href="/comparisons"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-neutral-100 font-semibold text-sm border border-white/15 shadow-md backdrop-blur-md transition-all duration-200 flex items-center justify-center gap-2 hover:border-blue-400/40 hover:scale-[1.02] active:scale-95"
            >
              <Scale className="w-4 h-4 text-blue-400" />
              <span>Compare Devices Side-by-Side</span>
            </Link>
          </div>

          {/* Trust Metrics Bar */}
          <div className="pt-10 border-t border-neutral-800/80 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-neutral-400">
            <div className="flex items-center justify-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5 backdrop-blur-xs">
              <Award className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="font-medium text-neutral-300">Spec-by-Spec Hardware Teardowns</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5 backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium text-neutral-300">Zero Sponsored Review Bias</span>
            </div>
            <div className="flex items-center justify-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5 backdrop-blur-xs">
              <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-medium text-neutral-300">Curated Multi-Country Price Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Tech Categories */}
      <section id="explore-categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
              <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Browse by Category</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Explore Tech Review Hubs
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
              Select a hardware category to browse curated buying guides, specifications, and device teardowns.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* 3. Latest Product Reviews & Guides */}
      <section id="latest-reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Fresh Insights
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white mt-0.5">
              Latest Product Reviews &amp; Guides
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
              Detailed breakdown of technical specifications, pros, cons, and buyer value.
            </p>
          </div>
          {latestBlogs.length > 0 && (
            <Link
              href="/blog"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>All Articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {latestBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          /* Modern, clean, welcoming empty state for fresh database */
          <div className="bg-white dark:bg-[#121826] border border-neutral-200/90 dark:border-neutral-800 rounded-3xl p-8 sm:p-12 text-center shadow-xs space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                Fresh Editorial Hub Ready
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                All previous demo posts have been wiped cleanly. You can start publishing your authentic research reviews and buying guides from the admin portal!
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/admin/blogs/new"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Write First Review</span>
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-all"
              >
                <span>Open Admin Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 4. Head-to-Head Comparison Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-950 via-indigo-950 to-neutral-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl border border-blue-800/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-3.5 max-w-xl relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800/60 border border-blue-500/30 text-blue-200 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md">
              <Scale className="w-3.5 h-3.5 text-blue-300" /> Interactive Comparison Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Compare Any Two Tech Devices Side-by-Side
            </h2>
            <p className="text-neutral-300 text-sm leading-relaxed">
              Unsure which device fits your workflow? Compare specifications, display panels, processor speeds, battery life, pros, cons, and merchant links across smartphones, laptops, and audio gear.
            </p>
          </div>
          
          <Link
            href="/comparisons"
            className="px-8 py-3.5 rounded-2xl bg-white text-neutral-900 font-extrabold text-sm hover:bg-neutral-100 transition-all shadow-xl hover:scale-105 active:scale-95 shrink-0 flex items-center gap-2 relative z-10"
          >
            <span>Launch Comparison Tool</span>
            <ArrowRight className="w-4 h-4 text-blue-600" />
          </Link>
        </div>
      </section>

      {/* 5. Featured Products Showcase */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Top Recommendations
              </span>
              <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-0.5">
                Featured Device Picks
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
                Researched product recommendations with verified specifications.
              </p>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View Product Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 6. Today's Amazon Deals Section */}
      {dealProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 dark:border-amber-900/40 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500 text-white">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                    Notable Amazon Deals &amp; Discounts
                  </h2>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Handpicked price drops and promotions</p>
                </div>
              </div>

              <Link
                href="/deals"
                className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>View All Deals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dealProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. Why Readers Trust BlogWeb904 (Editorial Standard) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#121826] rounded-3xl p-8 sm:p-12 border border-neutral-200/90 dark:border-neutral-800 space-y-8 shadow-xs">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Our Editorial Standard
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
              Why Readers Rely On BlogWeb904
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              We focus on clarity, hardware benchmark accuracy, and independent evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-neutral-50/80 dark:bg-neutral-900/60 p-6 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 space-y-3 hover:border-blue-400/40 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-neutral-900 dark:text-white text-base">Clear Answers First</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                No filler paragraphs or fluffy conclusions. We tell you upfront what a device is, whether it is worth buying, and what tradeoffs exist.
              </p>
            </div>

            <div className="bg-neutral-50/80 dark:bg-neutral-900/60 p-6 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 space-y-3 hover:border-emerald-400/40 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-neutral-900 dark:text-white text-base">Unbiased Evaluation</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                We clearly disclose affiliate relationships and never give positive scores simply because a product has an affiliate link.
              </p>
            </div>

            <div className="bg-neutral-50/80 dark:bg-neutral-900/60 p-6 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 space-y-3 hover:border-amber-400/40 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shadow-xs">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-neutral-900 dark:text-white text-base">Real Buying Considerations</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                We explicitly define who a product is for and who should avoid it, saving you from expensive purchasing mistakes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Learn more about our editorial methodology and affiliate disclosure standards.
          </p>
        </div>
        <FaqAccordion faqs={homeFaqs} />
      </section>
    </div>
  );
}
