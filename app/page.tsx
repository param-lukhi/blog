import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import ProductCard from '@/components/ProductCard';
import BlogCard from '@/components/BlogCard';
import CategoryCard from '@/components/CategoryCard';
import FaqAccordion from '@/components/FaqAccordion';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Award, Flame, Scale, CheckCircle2, BookOpen, Layers } from 'lucide-react';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'TechPulse - Research-Based Tech Reviews & Unbiased Buying Guides',
  description: 'In-depth research-based product reviews, hardware comparisons, and buying guides to help consumers make smart tech purchasing decisions.',
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
    take: 3,
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
  const heroButtonText = settings.hero_button_text || 'Browse Latest Reviews';

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
    <div className="space-y-16 pb-16 bg-white dark:bg-neutral-950">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-white py-20 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-neutral-800/80">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-12 right-1/4 w-80 h-80 bg-amazon-orange/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>People-First Editorial Research</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {heroTitle}
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed font-normal">
            {heroSubtitle}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#latest-reviews"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 hover:from-brand-500 hover:to-brand-400 text-white font-extrabold text-sm transition-all shadow-lg shadow-brand-600/30 hover:shadow-brand-500/50 active:scale-95"
            >
              {heroButtonText}
            </Link>

            <Link
              href="/comparisons"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800/90 text-neutral-100 font-semibold text-sm border border-neutral-700/80 shadow-md backdrop-blur-xs transition-all flex items-center justify-center gap-2 hover:border-brand-500/40"
            >
              <Scale className="w-4 h-4 text-brand-400" />
              <span>Compare Devices Side-by-Side</span>
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="pt-10 border-t border-neutral-800/80 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-neutral-400">
            <div className="flex items-center justify-center gap-2">
              <Award className="w-4 h-4 text-brand-400 shrink-0" />
              <span>Specification &amp; Feature Breakdown</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Unbiased Editorial Independence</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Curated Buying Recommendations</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 text-xs font-bold mb-2">
              <Layers className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Browse by Category</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-sans tracking-tight">
              Explore Tech Review Hubs
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
              Select a category to view buying guides, hardware teardowns, and research-backed reviews.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* 3. Latest Product Reviews */}
      <section id="latest-reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Fresh Insights
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-sans mt-0.5">
              Latest Product Reviews &amp; Guides
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
              Detailed breakdown of technical specifications, pros, cons, and buyer value.
            </p>
          </div>
          <Link
            href="/blog"
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            <span>All Articles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latestBlogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </section>

      {/* 4. Head-to-Head Comparison Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-900 to-neutral-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl border border-brand-800/40">
          <div className="space-y-3 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-800 text-brand-200 text-xs font-extrabold uppercase">
              <Scale className="w-3.5 h-3.5 text-brand-300" /> Comparison Engine
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
            className="px-8 py-3.5 rounded-2xl bg-white text-neutral-900 font-extrabold text-sm hover:bg-neutral-100 transition-colors shadow-md shrink-0 flex items-center gap-2"
          >
            <span>Launch Comparison Tool</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 5. Featured Products Showcase */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Top Recommendations
              </span>
              <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white font-sans mt-0.5">
                Featured Device Picks
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
                Researched product recommendations with verified specifications.
              </p>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
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

      {/* 7. Why Readers Trust TechPulse (Replaced fake testimonials with authentic editorial standard) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-3xl p-8 sm:p-10 border border-neutral-200 dark:border-neutral-800 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Our Editorial Standard
            </span>
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white">
              Why Readers Rely On TechPulse
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              We focus on clarity, accuracy, and independent evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-700 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-neutral-900 dark:text-white text-base">Clear Answers First</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                No filler paragraphs or fluffy conclusions. We tell you upfront what a device is, whether it is worth buying, and what tradeoffs exist.
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-700 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-neutral-900 dark:text-white text-base">Unbiased Evaluation</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                We clearly disclose affiliate relationships and never give positive scores simply because a product has an affiliate link.
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200/80 dark:border-neutral-700 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
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
