import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const setting = await db.setting.findUnique({
      where: { key: 'ads_txt_content' },
    });

    let content = setting?.value?.trim();
    if (!content) {
      content = `# BlogWeb904 - Authorized Digital Sellers (ads.txt)\n# Status: Configured\ngoogle.com, pub-6177323495001169, DIRECT, f08c47fec0942fa0\n`;
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch {
    return new NextResponse('google.com, pub-6177323495001169, DIRECT, f08c47fec0942fa0\n', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
