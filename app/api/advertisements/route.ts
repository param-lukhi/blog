import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const ads = await db.advertisement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(ads);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch advertisements' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, location, image, targetUrl, active } = body;

    if (!title || !image || !targetUrl) {
      return NextResponse.json({ error: 'Title, image URL, and target URL are required' }, { status: 400 });
    }

    const ad = await db.advertisement.create({
      data: {
        title: String(title).trim(),
        location: location || 'HEADER',
        image: String(image).trim(),
        targetUrl: String(targetUrl).trim(),
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return NextResponse.json(ad, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create advertisement' }, { status: 500 });
  }
}
