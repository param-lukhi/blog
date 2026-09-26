import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  // 1. Fetch real affiliate clicks from Analytics table
  const affiliateClicks = await prisma.analytics.findMany({
    where: {
      eventType: { in: ['AFFILIATE_CLICK', 'affiliate_click'] },
    },
    orderBy: { createdAt: 'desc' },
  });

  // 2. Fetch real conversions
  const conversions = await prisma.affiliateConversion.findMany({
    orderBy: { convertedAt: 'desc' },
  });

  const totalClicks = affiliateClicks.length;
  const totalConversions = conversions.length;
  const confirmedConversions = conversions.filter(c => c.status === 'CONFIRMED' || c.status === 'APPROVED');
  const pendingConversions = conversions.filter(c => c.status === 'PENDING');
  const rejectedConversions = conversions.filter(c => c.status === 'REJECTED');

  const confirmedRevenue = confirmedConversions.reduce((sum, c) => sum + (c.commission || 0), 0);
  const pendingRevenue = pendingConversions.reduce((sum, c) => sum + (c.commission || 0), 0);

  const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const epc = totalClicks > 0 ? (confirmedRevenue / totalClicks) : 0;

  // Breakdown by store
  const storeMap: Record<string, { clicks: number; conversions: number; revenue: number }> = {};
  for (const c of conversions) {
    const s = c.storeSlug || 'Unknown';
    if (!storeMap[s]) storeMap[s] = { clicks: 0, conversions: 0, revenue: 0 };
    storeMap[s].conversions += 1;
    storeMap[s].revenue += c.commission || 0;
  }

  // 3. Affiliate Link Health Audit
  const productPrices = await prisma.productPrice.findMany({
    include: { product: { select: { name: true, slug: true } } },
    take: 50,
  });

  const linkAudit = productPrices.map(pp => {
    let status = 'VALID';
    let issue: string | null = null;

    if (!pp.affiliateUrl && !pp.productUrl) {
      status = 'NOT_CONFIGURED';
      issue = 'Missing merchant link URL';
    } else if (pp.affiliateUrl && !pp.affiliateUrl.startsWith('https://')) {
      status = 'WARNING';
      issue = 'Insecure HTTP link protocol';
    } else if (pp.storeSlug === 'amazon' && pp.affiliateUrl && !pp.affiliateUrl.includes('tag=')) {
      status = 'WARNING';
      issue = 'Missing Amazon Associate tag parameter';
    }

    return {
      id: pp.id,
      productName: pp.product.name,
      storeName: pp.storeName,
      affiliateUrl: pp.affiliateUrl,
      status,
      issue,
    };
  });

  // 4. Affiliate Disclosure Audit on Published Blogs
  const blogs = await prisma.blog.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, title: true, slug: true, content: true },
  });

  const disclosureAudit = blogs.map(b => {
    const hasDisclosure = Boolean(
      b.content && (
        b.content.toLowerCase().includes('affiliate') ||
        b.content.toLowerCase().includes('commission') ||
        b.content.toLowerCase().includes('partner')
      )
    );

    return {
      blogId: b.id,
      title: b.title,
      slug: b.slug,
      hasDisclosure,
      status: hasDisclosure ? 'COMPLIANT' : 'MISSING_DISCLOSURE',
    };
  });

  return NextResponse.json({
    metrics: {
      totalClicks,
      totalConversions,
      confirmedRevenue,
      pendingRevenue,
      conversionRate,
      epc,
      isConversionDataAvailable: totalConversions > 0,
      availabilityMessage: totalConversions > 0 
        ? 'Active affiliate conversion data recorded.' 
        : 'CONVERSION DATA NOT AVAILABLE (No incoming postback webhooks recorded yet).',
    },
    storeBreakdown: Object.entries(storeMap).map(([store, data]) => ({ store, ...data })),
    linkAudit,
    disclosureAudit,
  });
}
