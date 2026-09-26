import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const deals = await db.deal.findMany({
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(deals);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, discount, originalPrice, dealPrice, dealUrl, badge, productId, status } = body;

    if (!title || !dealPrice || !dealUrl) {
      return NextResponse.json({ error: 'Title, deal price, and deal URL are required' }, { status: 400 });
    }

    const deal = await db.deal.create({
      data: {
        title: String(title).trim(),
        discount: discount ? String(discount).trim() : '',
        originalPrice: originalPrice ? String(originalPrice).trim() : String(dealPrice).trim(),
        dealPrice: String(dealPrice).trim(),
        dealUrl: String(dealUrl).trim(),
        badge: badge ? String(badge).trim() : 'HOT',
        productId: productId || null,
        status: status || 'PUBLISHED',
      },
    });

    try {
      revalidatePath('/deals');
      revalidatePath('/');
    } catch (_) {}

    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
  }
}
