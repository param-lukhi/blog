import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import { auditDataIntegrity } from '@/lib/dataIntegrity';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const report = await auditDataIntegrity();
    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to run data integrity audit' },
      { status: 500 }
    );
  }
}
