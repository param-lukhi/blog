import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const brands = await db.brand.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(brands);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, slug, description, logo } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }

    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      return NextResponse.json({ error: 'Brand slug is required' }, { status: 400 });
    }

    const brand = await db.brand.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description ? String(description).trim() : '',
        logo: logo ? String(logo).trim() : '',
      },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A brand with this name or slug already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}
