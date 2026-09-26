import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const where = status ? { status } : {};
  const items = await prisma.productionQueueItem.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const body = await req.json();
  const { topic, contentType, searchIntent, priority, dueDate, assignedTo } = body;

  if (!topic) {
    return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
  }

  const item = await prisma.productionQueueItem.create({
    data: {
      topic,
      contentType: contentType || 'PRODUCT_REVIEW',
      searchIntent: searchIntent || 'INFORMATIONAL',
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null,
      assignedTo: assignedTo || null,
      status: 'IDEA',
    },
  });

  return NextResponse.json(item, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const body = await req.json();
  const { id, status, sourceStatus, researchStatus, draftStatus, seoStatus, affiliateStatus, blogId } = body;

  if (!id) {
    return NextResponse.json({ error: 'Queue item ID is required' }, { status: 400 });
  }

  const updated = await prisma.productionQueueItem.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(sourceStatus && { sourceStatus }),
      ...(researchStatus && { researchStatus }),
      ...(draftStatus && { draftStatus }),
      ...(seoStatus && { seoStatus }),
      ...(affiliateStatus && { affiliateStatus }),
      ...(blogId && { blogId }),
    },
  });

  return NextResponse.json(updated);
}
