import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const storeSlug = searchParams.get("store");
    const productId = searchParams.get("product");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 50;

    // 1. Fetch real tracked affiliate click analytics events & conversions
    const clickWhere: any = { eventType: "AFFILIATE_CLICK" };
    if (productId) clickWhere.targetId = productId;

    const conversionWhere: any = {};
    if (storeSlug) conversionWhere.storeSlug = storeSlug;
    if (productId) conversionWhere.productId = productId;

    const [clicks, totalClicks, conversions, stores, products, blogs, priceAlertsCount] = await Promise.all([
      prisma.analytics.findMany({
        where: clickWhere,
        orderBy: { createdAt: "desc" },
        take: limit,
      }),
      prisma.analytics.count({ where: { eventType: "AFFILIATE_CLICK" } }),
      prisma.affiliateConversion.findMany({
        where: conversionWhere,
        orderBy: { convertedAt: "desc" },
        take: limit,
      }),
      prisma.store.findMany({ where: { isActive: true }, select: { name: true, slug: true } }),
      prisma.product.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          brand: true,
          priceAlerts: { select: { id: true } },
        },
      }),
      prisma.blog.findMany({ select: { id: true, title: true, slug: true, views: true } }),
      prisma.priceAlert.count(),
    ]);

    // Map entity references
    const productMap = new Map<string, any>(products.map((p: any) => [p.id, p]));
    const blogMap = new Map<string, any>(blogs.map((b: any) => [b.id, b]));

    // 2. Financial & Conversion Aggregations
    let pendingCommission = 0;
    let confirmedCommission = 0;
    let rejectedCommission = 0;
    let totalConfirmedRevenue = 0;
    let confirmedCount = 0;

    const storeStats: Record<string, { name: string; slug: string; clicks: number; conversions: number; confirmedCommission: number }> = {};
    stores.forEach((s: any) => {
      storeStats[s.slug] = {
        name: s.name,
        slug: s.slug,
        clicks: 0,
        conversions: 0,
        confirmedCommission: 0,
      };
    });

    conversions.forEach((conv: any) => {
      const comm = conv.commission || 0;
      const amt = conv.amount || 0;

      if (conv.status === 'CONFIRMED') {
        confirmedCommission += comm;
        totalConfirmedRevenue += amt;
        confirmedCount += 1;
      } else if (conv.status === 'PENDING') {
        pendingCommission += comm;
      } else if (conv.status === 'REJECTED' || conv.status === 'CANCELLED') {
        rejectedCommission += comm;
      }

      if (storeStats[conv.storeSlug]) {
        storeStats[conv.storeSlug].conversions += 1;
        if (conv.status === 'CONFIRMED') {
          storeStats[conv.storeSlug].confirmedCommission += comm;
        }
      }
    });

    // Count store clicks from click events
    clicks.forEach((c: any) => {
      const matchedStore = stores.find((s: any) => c.path?.includes(s.slug) || c.referrer?.includes(s.slug));
      if (matchedStore && storeStats[matchedStore.slug]) {
        storeStats[matchedStore.slug].clicks += 1;
      }
    });

    const conversionRate = totalClicks > 0 ? (confirmedCount / totalClicks) * 100 : 0;
    const conversionDataAvailable = conversions.length > 0;

    // 3. Article performance aggregation
    const perArticlePerformance: Record<string, { title: string; slug: string; views: number; clicks: number; conversions: number; confirmedCommission: number; lastClick: Date }> = {};

    blogs.forEach((b: any) => {
      perArticlePerformance[b.slug] = {
        title: b.title,
        slug: b.slug,
        views: b.views || 0,
        clicks: 0,
        conversions: 0,
        confirmedCommission: 0,
        lastClick: new Date(0),
      };
    });

    clicks.forEach((c: any) => {
      const blog = blogMap.get(c.targetId || "") || blogs.find((b: any) => c.path?.includes(b.slug));
      if (blog && perArticlePerformance[blog.slug]) {
        perArticlePerformance[blog.slug].clicks += 1;
        if (c.createdAt > perArticlePerformance[blog.slug].lastClick) {
          perArticlePerformance[blog.slug].lastClick = c.createdAt;
        }
      }
    });

    conversions.forEach((conv: any) => {
      if (conv.blogId) {
        const blog = blogMap.get(conv.blogId);
        if (blog && perArticlePerformance[blog.slug]) {
          perArticlePerformance[blog.slug].conversions += 1;
          if (conv.status === 'CONFIRMED') {
            perArticlePerformance[blog.slug].confirmedCommission += conv.commission;
          }
        }
      }
    });

    // 4. Product performance aggregation
    const productPerformance = products.map((prod: any) => {
      const prodClicks = clicks.filter((c: any) => c.targetId === prod.id || c.path?.includes(prod.slug)).length;
      const prodConvs = conversions.filter((c: any) => c.productId === prod.id);
      const confirmedProdConvs = prodConvs.filter((c: any) => c.status === 'CONFIRMED');
      const prodCommission = confirmedProdConvs.reduce((sum: number, c: any) => sum + c.commission, 0);

      return {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        brand: prod.brand,
        clicks: prodClicks,
        conversions: prodConvs.length,
        confirmedCommission: prodCommission,
        priceAlertsCount: prod.priceAlerts.length,
        conversionRate: prodClicks > 0 ? ((confirmedProdConvs.length / prodClicks) * 100).toFixed(1) + '%' : '0.0%',
      };
    }).sort((a: any, b: any) => b.clicks - a.clicks);

    // Format raw events
    const formattedEvents = clicks.map((c: any) => {
      const matchedProd = productMap.get(c.targetId || "");
      const matchedBlog = blogs.find((b: any) => c.path?.includes(b.slug));

      return {
        id: c.id,
        eventType: c.eventType,
        path: c.path,
        productName: matchedProd?.name || null,
        blogTitle: matchedBlog?.title || null,
        timestamp: c.createdAt,
        referrer: c.referrer || "Direct / Organic",
      };
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalClicks,
        totalConversions: conversions.length,
        confirmedConversions: confirmedCount,
        conversionRate: conversionRate.toFixed(2) + '%',
        pendingCommission: Number(pendingCommission.toFixed(2)),
        confirmedCommission: Number(confirmedCommission.toFixed(2)),
        rejectedCommission: Number(rejectedCommission.toFixed(2)),
        totalConfirmedRevenue: Number(totalConfirmedRevenue.toFixed(2)),
        conversionDataAvailable,
        activeStoresCount: stores.length,
        totalPriceAlerts: priceAlertsCount,
      },
      stores: Object.values(storeStats),
      conversions: conversions.map((conv: any) => {
        const prod = conv.productId ? productMap.get(conv.productId) : null;
        const blog = conv.blogId ? blogMap.get(conv.blogId) : null;
        return {
          id: conv.id,
          storeSlug: conv.storeSlug,
          externalTransactionId: conv.externalTransactionId || 'N/A',
          productName: prod?.name || 'Direct / Store Link',
          blogTitle: blog?.title || 'General',
          amount: conv.amount,
          commission: conv.commission,
          currency: conv.currency,
          status: conv.status,
          convertedAt: conv.convertedAt,
        };
      }),
      productPerformance: productPerformance.slice(0, 15),
      topPerformingContent: Object.values(perArticlePerformance)
        .filter((a: any) => a.clicks > 0 || a.conversions > 0 || a.views > 0)
        .sort((a: any, b: any) => (b.clicks + b.conversions * 5) - (a.clicks + a.conversions * 5))
        .slice(0, 10),
      recentClickEvents: formattedEvents,
    });
  } catch (error: any) {
    console.error("[Affiliate API] Error fetching affiliate analytics:", error);
    return NextResponse.json({ error: "Failed to fetch affiliate analytics" }, { status: 500 });
  }
}
