import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import PriceComparisonTable from '@/components/PriceComparisonTable';
import AmazonButton from '@/components/AmazonButton';
import RegionalPrice from '@/components/RegionalPrice';
import { safeJsonParse } from '@/lib/utils';
import { Scale, Check, X, ShieldCheck, ArrowRight, Sparkles, ChevronRight } from 'lucide-react';
import { generateBreadcrumbSchema } from '@/lib/seo';

export const dynamic = 'force-dynamic';

interface ComparisonPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ComparisonPageProps) {
  const parts = params.slug.split('-vs-');
  if (parts.length < 2) {
    return { title: 'Product Comparison | BlogWeb904' };
  }

  const slug1 = parts[0];
  const slug2 = parts[1];

  const [p1, p2] = await Promise.all([
    db.product.findUnique({ where: { slug: slug1 } }),
    db.product.findUnique({ where: { slug: slug2 } }),
  ]);

  const p1Name = p1?.name || slug1.replace(/-/g, ' ');
  const p2Name = p2?.name || slug2.replace(/-/g, ' ');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blogweb904.vercel.app';
  const pageUrl = `${siteUrl}/comparisons/${params.slug}`;
  const title = `${p1Name} vs ${p2Name}: Head-to-Head Specification & Price Comparison`;
  const description = `Compare ${p1Name} vs ${p2Name} side-by-side. Technical specs, pricing across stores, key differences, and buying guidance.`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'article',
    },
  };
}

export default async function HeadToHeadComparisonPage({ params }: ComparisonPageProps) {
  const parts = params.slug.split('-vs-');
  if (parts.length < 2) {
    notFound();
  }

  const [slug1, slug2] = parts;

  const [p1, p2] = await Promise.all([
    db.product.findUnique({
      where: { slug: slug1 },
      include: {
        category: true,
        prices: { orderBy: { price: 'asc' } },
      },
    }),
    db.product.findUnique({
      where: { slug: slug2 },
      include: {
        category: true,
        prices: { orderBy: { price: 'asc' } },
      },
    }),
  ]);

  if (!p1 && !p2) {
    notFound();
  }

  const p1Specs = safeJsonParse<Record<string, any>>(p1?.specifications, {});
  const p2Specs = safeJsonParse<Record<string, any>>(p2?.specifications, {});

  // Remove internal score keys
  delete p1Specs._ratingScores;
  delete p1Specs._priceHistory;
  delete p2Specs._ratingScores;
  delete p2Specs._priceHistory;

  const allSpecKeys = Array.from(
    new Set([...Object.keys(p1Specs), ...Object.keys(p2Specs)])
  );

  const p1Pros = safeJsonParse<string[]>(p1?.pros, []);
  const p1Cons = safeJsonParse<string[]>(p1?.cons, []);
  const p2Pros = safeJsonParse<string[]>(p2?.pros, []);
  const p2Cons = safeJsonParse<string[]>(p2?.cons, []);

  const p1Images = safeJsonParse<string[]>(p1?.images, []);
  const p2Images = safeJsonParse<string[]>(p2?.images, []);

  const p1Img = p1Images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';
  const p2Img = p2Images[0] || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800';

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blogweb904.vercel.app';
  const pageUrl = `${siteUrl}/comparisons/${params.slug}`;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Comparisons', url: `${siteUrl}/comparisons` },
    { name: `${p1?.name || slug1} vs ${p2?.name || slug2}`, url: pageUrl },
  ]);

  return (
    <main className="min-h-screen bg-neutral-50/50 dark:bg-[#0b0f17] py-12 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <Link href="/comparisons" className="hover:text-blue-600 dark:hover:text-blue-400">Comparisons</Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-neutral-800 dark:text-neutral-200 font-semibold truncate max-w-xs">
            {p1?.name || slug1} vs {p2?.name || slug2}
          </span>
        </nav>

        {/* Page Header */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 text-xs font-extrabold uppercase tracking-wide">
            <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Head-to-Head Spec Matrix
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
            {p1?.name || slug1} <span className="text-blue-600 dark:text-blue-400">vs</span> {p2?.name || slug2}
          </h1>
          <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Factual side-by-side comparison across technical specifications, pricing data, pros and cons to help you choose the best fit for your workflow.
          </p>
        </div>

        {/* Top Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product 1 Card */}
          <div className="bg-white dark:bg-[#121826] rounded-3xl p-6 sm:p-8 border border-neutral-200/90 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                <img
                  src={p1Img}
                  alt={p1?.name || 'Product 1'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold text-blue-600 dark:text-blue-400">
                  {p1?.brand || 'Brand'}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                  {p1?.name || slug1}
                </h2>
                <div className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-2">
                  {p1?.price || 'Check Current Price'}
                </div>
              </div>

              {p1?.category && (
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Category: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{p1.category.name}</span>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-col sm:flex-row gap-3">
              {p1?.amazonUrl && (
                <AmazonButton
                  url={p1.affiliateUrl || p1.amazonUrl}
                  price={p1.price}
                  size="md"
                  text={`Check ${p1.name} Price`}
                  className="w-full"
                />
              )}
              {p1?.slug && (
                <Link
                  href={`/product/${p1.slug}`}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 text-xs font-bold text-center transition-colors"
                >
                  View Details
                </Link>
              )}
            </div>
          </div>

          {/* Product 2 Card */}
          <div className="bg-white dark:bg-[#121826] rounded-3xl p-6 sm:p-8 border border-neutral-200/90 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                <img
                  src={p2Img}
                  alt={p2?.name || 'Product 2'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold text-blue-600 dark:text-blue-400">
                  {p2?.brand || 'Brand'}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                  {p2?.name || slug2}
                </h2>
                <div className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-2">
                  {p2?.price || 'Check Current Price'}
                </div>
              </div>

              {p2?.category && (
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Category: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{p2.category.name}</span>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-col sm:flex-row gap-3">
              {p2?.amazonUrl && (
                <AmazonButton
                  url={p2.affiliateUrl || p2.amazonUrl}
                  price={p2.price}
                  size="md"
                  text={`Check ${p2.name} Price`}
                  className="w-full"
                />
              )}
              {p2?.slug && (
                <Link
                  href={`/product/${p2.slug}`}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 text-xs font-bold text-center transition-colors"
                >
                  View Details
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Side-by-Side Spec Matrix */}
        <div className="bg-white dark:bg-[#121826] rounded-3xl p-6 sm:p-10 border border-neutral-200/90 dark:border-neutral-800 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 dark:border-neutral-800/80 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
              Technical Specification Matrix
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Verified parameters from official documentation and manufacturer specs.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 text-neutral-900 dark:text-white">
                  <th className="py-3.5 px-4 font-bold rounded-l-xl w-1/3">Feature / Spec</th>
                  <th className="py-3.5 px-4 font-bold w-1/3">{p1?.name || 'Option A'}</th>
                  <th className="py-3.5 px-4 font-bold rounded-r-xl w-1/3">{p2?.name || 'Option B'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                  <td className="py-3.5 px-4 font-semibold text-neutral-600 dark:text-neutral-400">Brand</td>
                  <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">{p1?.brand || 'N/A'}</td>
                  <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">{p2?.brand || 'N/A'}</td>
                </tr>
                <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                  <td className="py-3.5 px-4 font-semibold text-neutral-600 dark:text-neutral-400">Baseline Price</td>
                  <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">{p1?.price || 'Check price'}</td>
                  <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">{p2?.price || 'Check price'}</td>
                </tr>

                {allSpecKeys.map((key) => {
                  const val1 = p1Specs[key] ?? 'N/A';
                  const val2 = p2Specs[key] ?? 'N/A';
                  return (
                    <tr key={key} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                      <td className="py-3.5 px-4 font-medium text-neutral-600 dark:text-neutral-400">{key}</td>
                      <td className="py-3.5 px-4 text-neutral-900 dark:text-white font-semibold">
                        {typeof val1 === 'object' ? JSON.stringify(val1) : String(val1)}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-900 dark:text-white font-semibold">
                        {typeof val2 === 'object' ? JSON.stringify(val2) : String(val2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pros & Cons Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* P1 Pros & Cons */}
          <div className="bg-white dark:bg-[#121826] rounded-3xl p-6 sm:p-8 border border-neutral-200/90 dark:border-neutral-800 space-y-6">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              {p1?.name || 'Option A'} Summary
            </h3>
            {p1Pros.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Advantages</span>
                <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                  {p1Pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {p1Cons.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">Considerations</span>
                <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                  {p1Cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <X className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* P2 Pros & Cons */}
          <div className="bg-white dark:bg-[#121826] rounded-3xl p-6 sm:p-8 border border-neutral-200/90 dark:border-neutral-800 space-y-6">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              {p2?.name || 'Option B'} Summary
            </h3>
            {p2Pros.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Advantages</span>
                <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                  {p2Pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {p2Cons.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">Considerations</span>
                <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
                  {p2Cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <X className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Factual Target Audience & Buying Guidance (No fake winner bias) */}
        <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-3xl p-6 sm:p-10 space-y-4">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <span>Editorial Buying Guidance</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
            Which Option Should You Choose?
          </h3>
          <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
            Neither model is objectively superior in every metric. Choose <strong>{p1?.name || slug1}</strong> if you value its specific form factor, battery optimization, or price-to-performance ratio. Alternatively, choose <strong>{p2?.name || slug2}</strong> if your workflow benefits more from its dedicated ecosystem integration or unique feature strengths.
          </p>
        </div>
      </div>
    </main>
  );
}
