import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const blogs = await prisma.blog.findMany({
    include: {
      category: { select: { name: true, slug: true } },
      product: { select: { name: true, slug: true } },
      _count: { select: { comments: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const products = await prisma.product.findMany({
    include: {
      category: { select: { name: true, slug: true } },
      _count: { select: { blogs: true, deals: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { blogs: true, products: true } }
    },
    orderBy: { name: 'asc' }
  });

  const deals = await prisma.deal.findMany({
    include: { product: { select: { name: true, slug: true } } }
  });

  const comparisons = await prisma.comparison.findMany();
  const affiliateLinks = await prisma.affiliateLink.findMany();
  const settings = await prisma.setting.findMany();

  console.log('=== BLOGS (' + blogs.length + ') ===');
  blogs.forEach(b => {
    console.log(`- [${b.status}] "${b.title}" (slug: ${b.slug}, cat: ${b.category.name}, words in content: ${b.content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length}, views: ${b.views})`);
  });

  console.log('\n=== PRODUCTS (' + products.length + ') ===');
  products.forEach(p => {
    console.log(`- [${p.status}] "${p.name}" (slug: ${p.slug}, cat: ${p.category.name}, price: ${p.price}, featured: ${p.isFeatured}, deal: ${p.isDeal})`);
  });

  console.log('\n=== CATEGORIES (' + categories.length + ') ===');
  categories.forEach(c => {
    console.log(`- ${c.name} (slug: ${c.slug}) -> ${c._count.blogs} blogs, ${c._count.products} products`);
  });

  console.log('\n=== DEALS (' + deals.length + ') ===');
  deals.forEach(d => {
    console.log(`- [${d.status}] "${d.title}" discount: ${d.discount}, price: ${d.dealPrice}`);
  });

  console.log('\n=== COMPARISONS (' + comparisons.length + ') ===');
  comparisons.forEach(c => {
    console.log(`- [${c.status}] "${c.title}" slug: ${c.slug}`);
  });

  console.log('\n=== SETTINGS (' + settings.length + ') ===');
  settings.forEach(s => {
    console.log(`- ${s.key}: ${s.value}`);
  });
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
