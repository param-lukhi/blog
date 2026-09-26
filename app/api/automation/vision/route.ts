import { NextResponse } from 'next/server';
import { analyzeProductImage } from '@/lib/product-research';
import { isAuthorizedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { imageUrl, productQuery } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Please provide an image URL or uploaded file reference' },
        { status: 400 }
      );
    }

    const analysis = await analyzeProductImage(imageUrl, productQuery);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Vision analysis API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to analyze product image' },
      { status: 500 }
    );
  }
}
