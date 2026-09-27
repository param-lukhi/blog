import { PrismaClient } from '@prisma/client';
import { evaluateBlogQuality } from '../lib/qualityCheck';

const prisma = new PrismaClient();

async function main() {
  const blog = await prisma.blog.findUnique({
    where: { slug: 'dreame-x60-ultra-complete-features-indian-homes' },
    include: {
      category: true,
      product: {
        include: {
          prices: true,
        },
      },
    },
  });

  if (!blog) {
    console.error('❌ Blog not found!');
    process.exit(1);
  }

  console.log('--- BLOG VERIFICATION ---');
  console.log('ID:', blog.id);
  console.log('Title:', blog.title);
  console.log('Slug:', blog.slug);
  console.log('Status:', blog.status);
  console.log('Category:', blog.category.name, `(${blog.category.slug})`);
  console.log('Content character length:', blog.content.length);
  const words = blog.content.trim().split(/\s+/).filter(Boolean);
  console.log('Word count:', words.length);
  console.log('First 200 chars:', blog.content.substring(0, 200));

  console.log('--- LINKED PRODUCT ---');
  if (blog.product) {
    console.log('Product ID:', blog.product.id);
    console.log('Product Name:', blog.product.name);
    console.log('Brand:', blog.product.brand);
    console.log('Price:', blog.product.price);
    console.log('Prices count:', blog.product.prices.length);
    for (const p of blog.product.prices) {
      console.log(` - Store: ${p.storeName} (${p.storeSlug}): ₹${p.price} [inStock: ${p.inStock}]`);
    }
  } else {
    console.error('❌ Product not linked!');
  }

  console.log('--- RESEARCH RECORD ---');
  const research = await prisma.productResearch.findFirst({
    where: { name: 'Dreame X60 Ultra Complete' },
  });
  if (research) {
    console.log('Research ID:', research.id);
    console.log('Status:', research.status);
    console.log('Target Audience:', research.targetAudience);
    console.log('Search Intent:', research.searchIntent);
    const sources = JSON.parse(research.officialSources || '[]');
    console.log('Sources Count:', sources.length);
    for (const s of sources) {
      console.log(` * ${s.title} (${s.publisher}) -> ${s.url}`);
    }
    const facts = JSON.parse(research.factVerification || '{}');
    console.log('Verified Facts Count:', Object.keys(facts).length);
    for (const [k, v] of Object.entries(facts)) {
      console.log(` * [${(v as any).status}] ${k}: ${(v as any).claim}`);
    }
  }

  console.log('--- QUALITY EVALUATION ---');
  const quality = evaluateBlogQuality({
    title: blog.title,
    slug: blog.slug,
    metaTitle: blog.metaTitle || undefined,
    metaDescription: blog.metaDescription || undefined,
    content: blog.content,
    featuredImage: blog.featuredImage,
    amazonUrl: blog.amazonUrl,
    affiliateUrl: blog.affiliateUrl || undefined,
    specifications: blog.specifications,
    faqs: blog.faqs,
    qualityChecklist: blog.qualityChecklist,
  });

  console.log('Score:', quality.score);
  console.log('All Required Passed:', quality.allRequiredPassed);
  console.log('Ready For Approval:', quality.readyForApproval);
  console.log('Ready For Publishing:', quality.readyForPublishing);
  console.log('Warnings:', quality.warnings);
  for (const item of quality.items) {
    console.log(` [${item.passed ? 'PASSED' : 'FAILED'}] ${item.id}: ${item.label}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
