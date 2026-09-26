import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import { auditProductionUrls } from '@/lib/productionLaunch';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const urls = await auditProductionUrls();
    const invalidCount = urls.filter((u) => u.status !== 'VALID').length;

    return NextResponse.json({
      totalAudited: urls.length,
      invalidCount,
      healthyCount: urls.length - invalidCount,
      urls,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to audit production URLs' },
      { status: 500 }
    );
  }
}
