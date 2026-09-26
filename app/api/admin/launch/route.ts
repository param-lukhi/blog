import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import { auditProductionLaunch } from '@/lib/productionLaunch';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const launchData = await auditProductionLaunch();
    return NextResponse.json(launchData);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to perform launch audit' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const launchData = await auditProductionLaunch();
    return NextResponse.json({
      message: 'Launch diagnostic completed successfully',
      ...launchData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to re-run launch diagnostic' },
      { status: 500 }
    );
  }
}
