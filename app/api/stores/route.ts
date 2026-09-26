import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stores = await db.store.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(stores);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, slug, domain, logo, affiliateTag, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'Store name and slug are required' }, { status: 400 });
    }

    const store = await db.store.upsert({
      where: { slug: String(slug).trim().toLowerCase() },
      update: {
        name: String(name).trim(),
        domain: domain ? String(domain).trim() : null,
        logo: logo ? String(logo).trim() : null,
        affiliateTag: affiliateTag ? String(affiliateTag).trim() : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      create: {
        name: String(name).trim(),
        slug: String(slug).trim().toLowerCase(),
        domain: domain ? String(domain).trim() : null,
        logo: logo ? String(logo).trim() : null,
        affiliateTag: affiliateTag ? String(affiliateTag).trim() : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save store' }, { status: 500 });
  }
}
