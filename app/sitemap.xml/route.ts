import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://techpulsereviews.com').replace(/\/$/, '');

  const [blogs, products, categories, comparisons] = await Promise.all([
    db.blog.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    }),
    db.product.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    }),
    db.category.findMany({
      select: { slug: true, updatedAt: true },
    }),
    db.comparison.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    }).catch(() => []),
  ]);

  const staticPages = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: '/blog', priority: '0.9', changefreq: 'daily' },
    { path: '/products', priority: '0.9', changefreq: 'daily' },
    { path: '/comparisons', priority: '0.8', changefreq: 'weekly' },
    { path: '/deals', priority: '0.8', changefreq: 'daily' },
    { path: '/about', priority: '0.6', changefreq: 'monthly' },
    { path: '/contact', priority: '0.6', changefreq: 'monthly' },
    { path: '/privacy', priority: '0.5', changefreq: 'yearly' },
    { path: '/terms', priority: '0.5', changefreq: 'yearly' },
    { path: '/affiliate-disclosure', priority: '0.6', changefreq: 'monthly' },
    { path: '/cookie-policy', priority: '0.4', changefreq: 'yearly' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
    <url>
      <loc>${baseUrl}${page.path}</loc>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>`
    )
    .join('')}

  ${categories
    .map(
      (cat) => `
    <url>
      <loc>${baseUrl}/category/${cat.slug}</loc>
      <lastmod>${cat.updatedAt.toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>0.8</priority>
    </url>`
    )
    .join('')}

  ${blogs
    .map(
      (b) => `
    <url>
      <loc>${baseUrl}/blog/${b.slug}</loc>
      <lastmod>${b.updatedAt.toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
    </url>`
    )
    .join('')}

  ${products
    .map(
      (p) => `
    <url>
      <loc>${baseUrl}/product/${p.slug}</loc>
      <lastmod>${p.updatedAt.toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`
    )
    .join('')}

  ${comparisons
    .map(
      (c: any) => `
    <url>
      <loc>${baseUrl}/comparisons</loc>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`
    )
    .join('')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
    },
  });
}
