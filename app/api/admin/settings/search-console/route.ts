import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import { getSearchConsoleStatus, syncSearchConsoleData } from '@/lib/searchConsole';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const status = getSearchConsoleStatus();
  return NextResponse.json({ status });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const result = await syncSearchConsoleData(7);
  return NextResponse.json(result);
}
