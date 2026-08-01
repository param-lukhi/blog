import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const baseUrl = 'https://techpulsereviews.com';

  const blogs = await db.blog.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, updatedAt: true }
  });

  const products = await db.product.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, updatedAt: true }
  });

  const categories = await db.category.findMany({
    select: { slug: true }
  });

  const staticPages = ['', '/products', '/deals', '/about', '/contact', '/privacy', '/affiliate-disclosure'];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (page) => `
    <url>
      <loc>${baseUrl}${page}</loc>
      <changefreq>daily</changefreq>
      <priority>0.8</priority>
    </url>`
    )
    .join('')}

  ${categories
    .map(
      (cat) => `
    <url>
      <loc>${baseUrl}/category/${cat.slug}</loc>
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
      <priority>1.0</priority>
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
      <priority>0.9</priority>
    </url>`
    )
    .join('')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
