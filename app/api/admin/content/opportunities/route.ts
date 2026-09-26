import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';
import { discoverContentOpportunities } from '@/lib/contentEngine';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status');

  const whereClause = statusFilter ? { status: statusFilter } : {};

  let opportunities = await prisma.contentOpportunity.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  });

  // If no opportunities exist in DB, run real discovery engine and persist
  if (opportunities.length === 0) {
    const discovered = await discoverContentOpportunities();
    for (const opp of discovered) {
      await prisma.contentOpportunity.create({
        data: {
          topic: opp.topic,
          opportunityType: opp.opportunityType,
          reason: opp.reason,
          evidence: opp.evidence,
          relatedExistingContent: opp.relatedExistingContent,
          suggestedSearchIntent: opp.suggestedSearchIntent,
          priority: opp.priority,
          status: 'DISCOVERED',
        },
      });
    }

    opportunities = await prisma.contentOpportunity.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  return NextResponse.json({
    opportunities,
    total: opportunities.length,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const body = await req.json();
  const { topic, opportunityType, reason, evidence, priority, suggestedSearchIntent } = body;

  if (!topic || !opportunityType || !reason) {
    return NextResponse.json({ error: 'Missing required opportunity fields' }, { status: 400 });
  }

  const created = await prisma.contentOpportunity.create({
    data: {
      topic,
      opportunityType,
      reason,
      evidence: evidence || 'Manual editor input',
      priority: priority || 'MEDIUM',
      suggestedSearchIntent: suggestedSearchIntent || 'INFORMATIONAL',
      status: 'DISCOVERED',
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
  const { id, status, priority, assignedDate } = body;

  if (!id) {
    return NextResponse.json({ error: 'Missing opportunity ID' }, { status: 400 });
  }

  const updated = await prisma.contentOpportunity.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assignedDate && { assignedDate: new Date(assignedDate) }),
    },
  });

  return NextResponse.json(updated);
}
