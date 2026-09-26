import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const contentId = searchParams.get('contentId');

  const where = contentId ? { contentId } : {};
  const claims = await prisma.factCheckClaim.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ claims });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const body = await req.json();
  const { contentId, claimText, sourceUrl, sourceType, status, notes } = body;

  if (!claimText) {
    return NextResponse.json({ error: 'Claim text is required' }, { status: 400 });
  }

  const created = await prisma.factCheckClaim.create({
    data: {
      contentId,
      claimText,
      sourceUrl,
      sourceType: sourceType || 'OTHER',
      status: status || 'UNVERIFIED',
      notes,
      verifiedBy: status === 'VERIFIED' ? auth.username : null,
      verifiedAt: status === 'VERIFIED' ? new Date() : null,
    },
  });

  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const body = await req.json();
  const { id, status, notes, sourceUrl, sourceType } = body;

  if (!id) {
    return NextResponse.json({ error: 'Missing claim ID' }, { status: 400 });
  }

  const updated = await prisma.factCheckClaim.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
      ...(sourceUrl !== undefined && { sourceUrl }),
      ...(sourceType && { sourceType }),
      ...(status === 'VERIFIED' ? { verifiedBy: auth.username, verifiedAt: new Date() } : {}),
    },
  });

  return NextResponse.json(updated);
}
