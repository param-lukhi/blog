import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const PUBLIC_SETTING_KEYS = new Set([
  'site_name',
  'site_tagline',
  'hero_title',
  'hero_subtitle',
  'hero_button_text',
  'default_currency',
  'enable_auto_currency',
  'enable_multi_country',
  'default_marketplace',
  'site_logo',
  'content_categories',
  'price_categories',
  'affiliate_tag',
]);

export async function GET() {
  try {
    const settings = await db.setting.findMany();
    const settingsMap: Record<string, string> = {};
    const isAdmin = isAuthorizedAdmin();

    settings.forEach((s) => {
      if (isAdmin || PUBLIC_SETTING_KEYS.has(s.key)) {
        settingsMap[s.key] = s.value;
      }
    });

    return NextResponse.json(settingsMap);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json(); // key-value pairs

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid settings payload' }, { status: 400 });
    }

    for (const [key, value] of Object.entries(body)) {
      if (typeof key === 'string' && key.trim().length > 0) {
        await db.setting.upsert({
          where: { key: key.trim() },
          update: { value: String(value) },
          create: { key: key.trim(), value: String(value) },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
