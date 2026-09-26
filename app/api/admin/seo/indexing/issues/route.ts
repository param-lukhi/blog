import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import { auditIndexingIssues } from '@/lib/indexingIssues';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const report = await auditIndexingIssues();
    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to audit indexing issues' },
      { status: 500 }
    );
  }
}
