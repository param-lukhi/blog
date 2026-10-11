import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectContent() {
  const blogs = await prisma.blog.findMany({
    include: { category: true, product: true }
  });
  console.log('=== BLOG DETAILS ===');
  for (const b of blogs) {
    console.log('TITLE:', b.title);
    console.log('SLUG:', b.slug);
    console.log('META_TITLE:', b.metaTitle);
    console.log('META_DESC:', b.metaDescription);
    console.log('PROS:', b.pros);
    console.log('CONS:', b.cons);
    console.log('FAQS:', b.faqs);
    console.log('CONCLUSION:', b.conclusion);
    console.log('AMAZON_URL:', b.amazonUrl);
    console.log('AFFILIATE_URL:', b.affiliateUrl);
    console.log('CONTENT_LENGTH:', b.content.length);
    console.log('TAGS:', b.tags);
    console.log('CONTENT_SAMPLE:\n', b.content.slice(0, 500));
    console.log('-----------------------------------------');
  }

  const products = await prisma.product.findMany({
    include: { category: true }
  });
  console.log('=== PRODUCT DETAILS ===');
  for (const p of products) {
    console.log(JSON.stringify({
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: p.brand,
      price: p.price,
      images: p.images,
      category: p.category.name,
      specifications: p.specifications,
      features: p.features,
      pros: p.pros,
      cons: p.cons,
      affiliateUrl: p.affiliateUrl,
      amazonUrl: p.amazonUrl,
      marketplaces: p.marketplaces
    }, null, 2));
  }
}

inspectContent()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
