import { db } from '../lib/db';

async function updateTags() {
  console.log('Updating legacy affiliate tags in database...');

  const blogs = await db.blog.findMany({
    where: {
      OR: [
        { affiliateUrl: { contains: 'techpulse-20' } },
        { amazonUrl: { contains: 'techpulse-20' } },
      ],
    },
  });

  for (const b of blogs) {
    const updatedAff = b.affiliateUrl?.replace(/techpulse-20/g, 'blogweb904-20') || undefined;
    const updatedAmz = b.amazonUrl?.replace(/techpulse-20/g, 'blogweb904-20') || undefined;
    await db.blog.update({
      where: { id: b.id },
      data: { affiliateUrl: updatedAff, amazonUrl: updatedAmz },
    });
    console.log(`Updated Blog ${b.slug} affiliate URL.`);
  }

  const products = await db.product.findMany({
    where: {
      OR: [
        { affiliateUrl: { contains: 'techpulse-20' } },
        { amazonUrl: { contains: 'techpulse-20' } },
      ],
    },
  });

  for (const p of products) {
    const updatedAff = p.affiliateUrl?.replace(/techpulse-20/g, 'blogweb904-20') || undefined;
    const updatedAmz = p.amazonUrl?.replace(/techpulse-20/g, 'blogweb904-20') || undefined;
    await db.product.update({
      where: { id: p.id },
      data: { affiliateUrl: updatedAff, amazonUrl: updatedAmz },
    });
    console.log(`Updated Product ${p.name} affiliate URL.`);
  }

  console.log('Affiliate tag update complete.');
}

updateTags().catch(console.error);
