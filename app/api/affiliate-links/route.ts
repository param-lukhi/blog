import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const links = await db.affiliateLink.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(links);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch affiliate links' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, originalUrl, cloakedUrl, category } = body;

    if (!title || !originalUrl || !cloakedUrl) {
      return NextResponse.json({ error: 'Title, original URL, and cloaked URL are required' }, { status: 400 });
    }

    const link = await db.affiliateLink.create({
      data: {
        title: String(title).trim(),
        originalUrl: String(originalUrl).trim(),
        cloakedUrl: String(cloakedUrl).trim().toLowerCase(),
        category: category ? String(category).trim() : 'General',
        clicks: 0,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'An affiliate link with this cloaked URL already exists.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create affiliate link' }, { status: 500 });
  }
}
