import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import BlogCard from '@/components/BlogCard';
import { BookOpen, Sparkles, PlusCircle, Compass, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Product Reviews, Buying Guides & Tech Articles - BlogWeb904',
  description: 'Explore in-depth product reviews, buying guides, specification breakdowns, and multi-store price comparisons for smartphones, laptops, audio gear, and gadgets.',
};

export default async function BlogListPage() {
  const blogs = await db.blog.findMany({
    where: { status: 'PUBLISHED' },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  const categories = await db.category.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="min-h-screen bg-neutral-50/50 dark:bg-[#0b0f17] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-extrabold uppercase tracking-wide">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Editorial Reviews &amp; Guides
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Research-Based Product Reviews &amp; Guides
          </h1>
          <p className="text-base text-neutral-600 dark:text-neutral-400">
            In-depth specification analysis, verified user feedback synthesis, pros &amp; cons, and curated buying recommendations.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Link
            href="/blog"
            className="px-4 py-2 rounded-full bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20"
          >
            All Articles ({blogs.length})
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="px-4 py-2 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 text-neutral-700 dark:text-neutral-300 font-semibold text-xs transition-colors hover:scale-105 active:scale-95"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Blog Grid */}
        {blogs.length === 0 ? (
          <div className="bg-white dark:bg-[#121826] rounded-3xl p-12 text-center border border-neutral-200/90 dark:border-neutral-800 max-w-xl mx-auto space-y-6 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white">
                Fresh Editorial Hub Ready
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                All sample articles have been cleared cleanly. You can write your first authentic product review directly from the admin panel!
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
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold transition-all"
              >
                <span>Back to Home</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
