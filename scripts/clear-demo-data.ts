import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearData() {
  console.log('Clearing all demo blogs, products, comments, comparisons, and deals...');

  // Delete dependent items first
  await prisma.comment.deleteMany({});
  console.log('✓ Cleared all comments');

  await prisma.deal.deleteMany({});
  console.log('✓ Cleared all deals');

  await prisma.comparison.deleteMany({});
  console.log('✓ Cleared all comparisons');

  await prisma.blog.deleteMany({});
  console.log('✓ Cleared all blogs');

  await prisma.product.deleteMany({});
  console.log('✓ Cleared all products');

  await prisma.affiliateLink.deleteMany({});
  console.log('✓ Cleared all affiliate links');

  console.log('✅ Successfully removed all products and blogs! Database is now a clean slate.');
}

clearData()
  .catch((e) => {
    console.error('Error wiping demo data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
