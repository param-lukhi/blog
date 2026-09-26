import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';
import { auditAmazonTag } from '@/lib/publishingWorkflow';
import { getEmailProviderStatus } from '@/lib/email/provider';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const amazonAudit = auditAmazonTag();
  const emailStatus = getEmailProviderStatus();
  const conversions = await prisma.affiliateConversion.count();
  const publishedProducts = await prisma.product.count({ where: { status: 'PUBLISHED' } });
  const publishedBlogs = await prisma.blog.count({ where: { status: 'PUBLISHED' } });
  const priceAlerts = await prisma.priceAlert.count();

  const channels = [
    {
      channel: 'Amazon Associates',
      status: amazonAudit.status === 'VERIFIED' ? 'READY' : 'CONFIGURATION REQUIRED',
      details: amazonAudit.message,
    },
    {
      channel: 'Google AdSense',
      status: publishedBlogs >= 10 ? 'READY' : 'NEEDS ATTENTION',
      details: `${publishedBlogs} published articles (Recommended: 15+ rich articles before application).`,
    },
    {
      channel: 'Newsletter Monetization & Digests',
      status: emailStatus.configured ? 'READY' : 'CONFIGURATION REQUIRED',
      details: emailStatus.statusText,
    },
    {
      channel: 'Price Drop Alert Pipeline',
      status: 'READY',
      details: `Active price monitoring engine (${priceAlerts} registered alerts).`,
    },
    {
      channel: 'Affiliate Conversion Postbacks',
      status: conversions > 0 ? 'READY' : 'NOT AVAILABLE',
      details: conversions > 0 ? `${conversions} verified orders recorded` : 'No incoming postback webhooks recorded yet.',
    },
  ];

  return NextResponse.json({
    channels,
    summary: {
      totalChannels: channels.length,
      readyCount: channels.filter(c => c.status === 'READY').length,
      configurationRequiredCount: channels.filter(c => c.status === 'CONFIGURATION REQUIRED').length,
    },
  });
}
