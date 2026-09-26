import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { matchProductsToQuiz, QuizAnswers } from '@/lib/quizEngine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const answers: QuizAnswers = await req.json();

    // Fetch published products with verified prices and category relations
    const products = await prisma.product.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        category: { select: { name: true, slug: true } },
        prices: {
          select: {
            storeName: true,
            storeSlug: true,
            price: true,
            affiliateUrl: true,
            inStock: true,
          },
        },
      },
    });

    const matches = matchProductsToQuiz(products, answers);

    return NextResponse.json({
      success: true,
      totalCatalogChecked: products.length,
      matches,
    });
  } catch (error: any) {
    console.error('[Quiz API Error]', error);
    return NextResponse.json({ error: 'Failed to process quiz recommendations' }, { status: 500 });
  }
}
