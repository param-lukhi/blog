import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';
import { discoverContentOpportunities } from '@/lib/contentEngine';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  // 1. Fetch content events by status
  const blogs = await prisma.blog.findMany({
    select: { id: true, title: true, slug: true, status: true, createdAt: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });

  const calendarEvents = blogs.map(b => ({
    id: b.id,
    title: b.title,
    slug: b.slug,
    type: 'BLOG',
    status: b.status,
    date: b.updatedAt,
  }));

  // 2. Daily Recommendations (Max 3/day)
  let opportunities = await prisma.contentOpportunity.findMany({
    where: { status: 'DISCOVERED' },
    orderBy: { priority: 'asc' }, // HIGH first
    take: 3,
  });

  if (opportunities.length === 0) {
    const fresh = await discoverContentOpportunities();
    opportunities = fresh.slice(0, 3) as any;
  }

  const dailyRecommendations = opportunities.slice(0, 3).map(o => ({
    topic: o.topic,
    reason: o.reason,
    evidence: o.evidence,
    opportunityType: o.opportunityType,
    suggestedSearchIntent: o.suggestedSearchIntent,
    priority: o.priority,
    verificationReminder: 'Fact-check all technical claims from official manufacturer datasheets before publishing.',
  }));

  return NextResponse.json({
    calendarEvents,
    dailyRecommendations,
  });
}
