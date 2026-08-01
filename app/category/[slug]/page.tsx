import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import BlogCard from '@/components/BlogCard';
import ProductCard from '@/components/ProductCard';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = await db.category.findUnique({ where: { slug: params.slug } });
  if (!category) return {};
  return {
    title: `Best ${category.name} Reviews & Buying Guides (2026)`,
    description: category.description || `In-depth reviews and Amazon buying guides for ${category.name}.`,
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await db.category.findUnique({
    where: { slug: params.slug },
  });

  if (!category) notFound();

  const blogs = await db.blog.findMany({
    where: { categoryId: category.id, status: 'PUBLISHED' },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  const products = await db.product.findMany({
    where: { categoryId: category.id, status: 'PUBLISHED' },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="pb-16 pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Category Header */}
      <div className="bg-neutral-900 text-white rounded-3xl p-8 sm:p-12">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs uppercase font-extrabold tracking-wider text-brand-400">
            Category Review Hub
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-neutral-300 text-base leading-relaxed">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Blogs Articles Section */}
      {blogs.length > 0 && (
        <section>
          <h2 className="text-2xl font-extrabold text-neutral-900 mb-6 font-sans">
            Hands-on Reviews & Buying Guides ({blogs.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map((b) => (
              <BlogCard key={b.id} blog={b} />
            ))}
          </div>
        </section>
      )}

      {/* Products Catalog Section */}
      {products.length > 0 && (
        <section>
          <h2 className="text-2xl font-extrabold text-neutral-900 mb-6 font-sans">
            Top Rated Products in {category.name} ({products.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {blogs.length === 0 && products.length === 0 && (
        <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-neutral-200">
          <p className="text-neutral-500 text-base">No reviews or products published in this category yet.</p>
          <Link href="/" className="mt-4 inline-block text-sm font-bold text-brand-600 hover:underline">
            Return to Homepage
          </Link>
        </div>
      )}
    </div>
  );
}
