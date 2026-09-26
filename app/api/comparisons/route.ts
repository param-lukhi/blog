import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const comparisons = await db.comparison.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const populated = await Promise.all(
      comparisons.map(async (c) => {
        const p1 = await db.product.findUnique({ where: { id: c.product1Id } });
        const p2 = await db.product.findUnique({ where: { id: c.product2Id } });
        return {
          ...c,
          product1: p1,
          product2: p2,
        };
      })
    );

    return NextResponse.json(populated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comparisons' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, slug, summary, product1Id, product2Id, winnerId } = body;

    if (!title || !slug || !product1Id || !product2Id) {
      return NextResponse.json({ error: 'Title, slug, product1, and product2 are required' }, { status: 400 });
    }

    const comparison = await db.comparison.create({
      data: {
        title: String(title).trim(),
        slug: String(slug).trim().toLowerCase(),
        summary: summary ? String(summary).trim() : '',
        product1Id,
        product2Id,
        winnerId: winnerId || product1Id,
        status: 'PUBLISHED',
      },
    });

    try {
      revalidatePath('/comparisons');
    } catch (_) {}

    return NextResponse.json(comparison, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A comparison with this slug already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create comparison' }, { status: 500 });
  }
}
