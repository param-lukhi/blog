import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';
import { getPublishingSummary } from '@/lib/publishingWorkflow';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const summary = await getPublishingSummary();

  const activeQueue = await prisma.productionQueueItem.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json({
    summary,
    queue: activeQueue,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const body = await req.json();
  const { action, targetCount, topic, contentType, searchIntent, priority, opportunityId } = body;

  if (action === 'SET_TARGET') {
    const updated = await prisma.publishingTarget.upsert({
      where: { period: 'DAILY' },
      update: { targetCount: Number(targetCount) || 1 },
      create: { period: 'DAILY', targetCount: Number(targetCount) || 1 },
    });
    return NextResponse.json(updated);
  }

  if (action === 'START_ARTICLE') {
    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const item = await prisma.productionQueueItem.create({
      data: {
        topic,
        contentType: contentType || 'PRODUCT_REVIEW',
        searchIntent: searchIntent || 'COMMERCIAL',
        priority: priority || 'HIGH',
        status: 'RESEARCHING',
        sourceStatus: 'PENDING',
        researchStatus: 'IN_PROGRESS',
        draftStatus: 'NOT_STARTED',
      },
    });

    if (opportunityId) {
      await prisma.contentOpportunity.update({
        where: { id: opportunityId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    return NextResponse.json(item, { status: 201 });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
