import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const experiments = await prisma.growthExperiment.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ experiments });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const body = await req.json();
  const { name, hypothesis, targetMetric, variants } = body;

  if (!name || !hypothesis || !targetMetric) {
    return NextResponse.json({ error: 'Missing required experiment fields' }, { status: 400 });
  }

  const created = await prisma.growthExperiment.create({
    data: {
      name,
      hypothesis,
      targetMetric,
      variants: typeof variants === 'string' ? variants : JSON.stringify(variants || { A: 'Control', B: 'Variant 1' }),
      status: 'DRAFT',
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
  const { id, status, winnerVariant, results } = body;

  if (!id) {
    return NextResponse.json({ error: 'Missing experiment ID' }, { status: 400 });
  }

  const updated = await prisma.growthExperiment.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(winnerVariant !== undefined && { winnerVariant }),
      ...(results !== undefined && { results: typeof results === 'string' ? results : JSON.stringify(results) }),
      ...(status === 'RUNNING' ? { startDate: new Date() } : {}),
      ...(status === 'CONCLUDED' ? { endDate: new Date() } : {}),
    },
  });

  return NextResponse.json(updated);
}
