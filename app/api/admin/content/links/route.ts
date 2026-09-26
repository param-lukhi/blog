import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';
import { analyzeContentClusters } from '@/lib/contentEngine';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { orphanPages, cannibalizationRisks } = await analyzeContentClusters();

  const internalLinkSuggestions = await prisma.internalLinkSuggestion.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    orphanPages,
    cannibalizationRisks,
    internalLinkSuggestions,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const body = await req.json();
  const { sourceUrl, sourceTitle, targetUrl, targetTitle, suggestedAnchor, reason } = body;

  if (!sourceUrl || !targetUrl || !suggestedAnchor) {
    return NextResponse.json({ error: 'Missing required link suggestion fields' }, { status: 400 });
  }

  const created = await prisma.internalLinkSuggestion.create({
    data: {
      sourceUrl,
      sourceTitle,
      targetUrl,
      targetTitle,
      suggestedAnchor,
      reason: reason || 'Contextual relevance suggestion',
      status: 'PENDING',
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
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json({ error: 'Missing ID or status' }, { status: 400 });
  }

  const updated = await prisma.internalLinkSuggestion.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(updated);
}
