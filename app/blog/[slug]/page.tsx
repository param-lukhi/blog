import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import AmazonButton from '@/components/AmazonButton';
import RegionalPrice from '@/components/RegionalPrice';
import ProsCons from '@/components/ProsCons';
import FaqAccordion from '@/components/FaqAccordion';
import ProductCard from '@/components/ProductCard';
import ReviewScores from '@/components/ReviewScores';
import PriceHistoryChart from '@/components/PriceHistoryChart';
import SocialShare from '@/components/SocialShare';
import CommentsSection from '@/components/CommentsSection';
import { formatDate, estimateReadTime, safeJsonParse } from '@/lib/utils';
import { Clock, ShieldCheck, Tag, ChevronRight, CheckCircle2 } from 'lucide-react';
import { generateReviewSchema } from '@/lib/seo';
import { parseMarkdownToHtml } from '@/lib/markdown';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const blog = await db.blog.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!blog) return {};

  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || `Read our hands-on review of ${blog.title}.`,
    openGraph: {
      title: blog.title,
      description: blog.metaDescription || '',
      images: [{ url: blog.featuredImage }],
    },
  };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const blog = await db.blog.findUnique({
    where: { slug: params.slug },
    include: { category: true, product: true },
  });

  if (!blog || blog.status !== 'PUBLISHED') {
    notFound();
  }

  // Increment view counter in background
  db.blog.update({
    where: { id: blog.id },
    data: { views: { increment: 1 } },
  }).catch(() => {});


  // Related products from same category
  const relatedProducts = await db.product.findMany({
    where: { categoryId: blog.categoryId, status: 'PUBLISHED' },
    take: 4,
  });

  const linkedProduct = blog.product;

  const rawBlogSpecs = safeJsonParse<Record<string, string>>(blog.specifications, {});
  const rawProdSpecs = linkedProduct ? safeJsonParse<Record<string, string>>(linkedProduct.specifications, {}) : {};

  const ratingScores = rawBlogSpecs._ratingScores
    ? safeJsonParse(rawBlogSpecs._ratingScores, null) || rawBlogSpecs._ratingScores
    : (rawProdSpecs._ratingScores ? safeJsonParse(rawProdSpecs._ratingScores, null) || rawProdSpecs._ratingScores : null);

  const priceHistoryData = rawBlogSpecs._priceHistory
    ? safeJsonParse(rawBlogSpecs._priceHistory, null) || rawBlogSpecs._priceHistory
    : (rawProdSpecs._priceHistory ? safeJsonParse(rawProdSpecs._priceHistory, null) || rawProdSpecs._priceHistory : null);

  const rawMergedSpecs = { ...rawProdSpecs, ...rawBlogSpecs };
  const specifications = { ...rawMergedSpecs };
  delete specifications._ratingScores;
  delete specifications._priceHistory;

  const features = safeJsonParse<string[]>(
    blog.features && blog.features !== '[]' ? blog.features : (linkedProduct?.features || '[]'),
    []
  );
  const pros = safeJsonParse<string[]>(
    blog.pros && blog.pros !== '[]' ? blog.pros : (linkedProduct?.pros || '[]'),
    []
  );
  const cons = safeJsonParse<string[]>(
    blog.cons && blog.cons !== '[]' ? blog.cons : (linkedProduct?.cons || '[]'),
    []
  );
  const faqs = safeJsonParse<{ question: string; answer: string }[]>(blog.faqs, []);
  const tags = safeJsonParse<string[]>(blog.tags, []);

  const readTime = estimateReadTime(blog.content);

  // Schema.org Review Structured Data
  const jsonLd = generateReviewSchema({
    title: blog.title,
    description: blog.metaDescription || blog.title,
    image: blog.featuredImage,
    itemReviewed: {
      name: blog.product ? blog.product.name : blog.title,
      brand: blog.product ? blog.product.brand : 'TechPulse Tested',
    },
  });

  return (
    <article className="pb-16 pt-6 bg-neutral-50 dark:bg-neutral-950">
      {/* Schema.org Script injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-6 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-brand-600 dark:hover:text-brand-400">Home</Link>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <Link href={`/category/${blog.category.slug}`} className="hover:text-brand-600 dark:hover:text-brand-400">
            {blog.category.name}
          </Link>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <span className="text-neutral-800 dark:text-neutral-200 font-medium truncate max-w-xs">{blog.title}</span>
        </nav>

        {/* Title & Metadata */}
        <header className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-bold px-3 py-1 rounded-full">
              {blog.category.name}
            </span>
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              <span>{formatDate(blog.createdAt)}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-400" />
                {readTime}
              </span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight">
            {blog.title}
          </h1>

          {blog.metaDescription && (
            <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
              {blog.metaDescription}
            </p>
          )}

          {/* Author & Verified Disclosure Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
                T
              </div>
              <div>
                <span className="font-bold text-neutral-900 dark:text-white">Tested by TechPulse Lab</span>
                <span className="block text-[11px] text-neutral-400">Independent Review & Benchmarking</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Amazon Affiliate Partner</span>
            </div>
          </div>
        </header>

        {/* Hero Featured Image */}
        <div className="relative aspect-[16/9] rounded-3xl overflow-hidden mb-10 shadow-sm bg-neutral-100 dark:bg-neutral-800">
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Quick Summary Box with Amazon Buy Button */}
        <div className="bg-neutral-900 text-white rounded-3xl p-6 sm:p-8 mb-10 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
                Product Quick Verdict
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {blog.product ? blog.product.name : blog.title}
              </h2>
              {blog.product && (
                <div className="text-neutral-400 text-xs mt-1">
                  Brand: <strong className="text-neutral-200">{blog.product.brand}</strong>
                </div>
              )}
            </div>

            {blog.product && (
              <div className="text-right">
                <span className="text-xs text-neutral-400 block mb-1 font-semibold">Best Price Deal</span>
                <RegionalPrice
                  basePrice={blog.product.price}
                  amazonUrl={blog.amazonUrl}
                  affiliateUrl={blog.affiliateUrl}
                  marketplaces={blog.marketplaces || blog.product.marketplaces}
                  className="text-2xl font-extrabold text-white"
                  showFlag={true}
                />
              </div>
            )}
          </div>

          {/* Highlights bullet points */}
          {features.length > 0 && (
            <ul className="space-y-2 text-sm text-neutral-300">
              {features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Amazon CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
            <AmazonButton
              url={blog.affiliateUrl || blog.amazonUrl}
              price={blog.product?.price}
              blogId={blog.id}
              marketplaces={blog.marketplaces || blog.product?.marketplaces}
              size="lg"
              className="w-full sm:w-auto"
              text="View Best Price on Amazon"
            />
            <span className="text-xs text-neutral-400 text-center sm:text-left">
              *Direct link to Amazon official store. Prices update dynamically.
            </span>
          </div>
        </div>

        {/* TechPulse Test Bench Scores */}
        <ReviewScores scoresData={ratingScores || undefined} />

        {/* Amazon Price History Chart */}
        <PriceHistoryChart currentPrice={blog.product?.price || '$1,199'} historyData={priceHistoryData || undefined} />

        {/* Key Specifications Table */}
        {Object.keys(specifications).length > 0 && (
          <section className="my-10 bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 font-sans">
              Key Specifications & Technical Data
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {Object.entries(specifications).map(([key, val]) => (
                <div key={key} className="bg-neutral-50 dark:bg-neutral-800/40 p-3 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60 flex justify-between gap-3 min-w-0">
                  <span className="text-neutral-500 dark:text-neutral-400 font-medium shrink-0">{key}:</span>
                  <span className="font-bold text-neutral-900 dark:text-white text-right min-w-0 break-words">{val}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pros & Cons Section */}
        {(pros.length > 0 || cons.length > 0) && (
          <ProsCons pros={pros} cons={cons} />
        )}

        {/* Hands-on Blog Content */}
        <section 
          className="prose dark:prose-invert max-w-none my-10 font-sans leading-relaxed text-neutral-800 dark:text-neutral-200"
          dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(blog.content) }}
        />

        {/* Conclusion / Final Verdict Box */}
        {blog.conclusion && (
          <section className="bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 rounded-3xl p-6 sm:p-8 my-10 space-y-4">
            <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white font-sans">
              Final Verdict: Should You Buy It?
            </h3>
            <p className="text-neutral-800 dark:text-neutral-200 text-base leading-relaxed">
              {blog.conclusion}
            </p>
            <div className="pt-2">
              <AmazonButton
                url={blog.affiliateUrl || blog.amazonUrl}
                blogId={blog.id}
                size="md"
                text="Check Availability on Amazon"
              />
            </div>
          </section>
        )}

        {/* FAQs Section */}
        {faqs.length > 0 && (
          <FaqAccordion faqs={faqs} />
        )}

        {/* Comments Section */}
        <CommentsSection />

        {/* Social Share & Tags */}
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          {tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-neutral-400" />
              {tags.map((t, i) => (
                <span key={i} className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2.5 py-1 rounded-md font-medium">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <SocialShare title={blog.title} />
        </div>

        {/* Related Products Recommendations */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-neutral-200 dark:border-neutral-800">
            <h3 className="text-2xl font-extrabold text-neutral-900 dark:text-white mb-6 font-sans">
              Related Product Reviews
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
