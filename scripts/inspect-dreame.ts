import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const b = await prisma.blog.findFirst({
    where: { slug: { contains: 'dreame' } }
  });
  if (!b) {
    console.log('No Dreame blog found');
    return;
  }
  console.log('SLUG:', b.slug);
  console.log('TITLE:', b.title);
  console.log('PROS:', b.pros);
  console.log('CONS:', b.cons);
  console.log('FAQS:', b.faqs);
  console.log('CONCLUSION:', b.conclusion);
  console.log('SPECIFICATIONS:', b.specifications);
}

main().finally(() => prisma.$disconnect());
