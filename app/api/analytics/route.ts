import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    // 1. Total Page Views from Analytics table
    const totalPageViews = await db.analytics.count({
      where: { eventType: 'PAGE_VIEW' },
    });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayVisitors = await db.analytics.count({
      where: {
        eventType: 'PAGE_VIEW',
        createdAt: { gte: startOfToday },
      },
    });

    const monthlyVisitors = await db.analytics.count({
      where: {
        eventType: 'PAGE_VIEW',
        createdAt: { gte: startOfMonth },
      },
    });

    const blogViewsCount = await db.analytics.count({
      where: { eventType: 'PAGE_VIEW', targetType: 'BLOG' },
    });

    const productViewsCount = await db.analytics.count({
      where: { eventType: 'PAGE_VIEW', targetType: 'PRODUCT' },
    });

    const totalAffiliateClicks = await db.analytics.count({
      where: { eventType: 'AFFILIATE_CLICK' },
    });

    const ctr = totalPageViews > 0 ? ((totalAffiliateClicks / totalPageViews) * 100).toFixed(1) : '0.0';

    // 2. Real Counts from Database
    const totalProductsCount = await db.product.count();
    const publishedBlogsCount = await db.blog.count({ where: { status: 'PUBLISHED' } });
    const draftBlogsCount = await db.blog.count({ where: { status: 'DRAFT' } });
    const reviewBlogsCount = await db.blog.count({ where: { status: 'REVIEW' } });
    const approvedBlogsCount = await db.blog.count({ where: { status: 'APPROVED' } });
    const scheduledBlogsCount = await db.blog.count({ where: { status: 'SCHEDULED' } });
    const totalCategoriesCount = await db.category.count();
    const totalMediaCount = await db.media.count();
    const researchQueueCount = await db.productResearch.count({ where: { status: { in: ['IDEA', 'RESEARCHING', 'RESEARCHED'] } } });
    
    // Price freshness check (stale > 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const stalePricesCount = await db.productPrice.count({
      where: {
        OR: [
          { lastCheckedAt: { lt: sevenDaysAgo } },
          { lastCheckedAt: null as any },
        ],
      },
    });

    // 3. Fetch all blogs with category & product info
    const blogs = await db.blog.findMany({
      include: { category: true, product: true },
      orderBy: { createdAt: 'desc' },
    });

    // 4. Fetch per-blog affiliate click counts from Analytics table
    const affiliateClickGroup = await db.analytics.groupBy({
      by: ['targetId', 'path'],
      where: { eventType: 'AFFILIATE_CLICK' },
      _count: { id: true },
    });

    const clicksMap: Record<string, number> = {};
    affiliateClickGroup.forEach((group) => {
      if (group.targetId) {
        clicksMap[group.targetId] = (clicksMap[group.targetId] || 0) + group._count.id;
      }
      if (group.path) {
        const match = group.path.match(/\/blog\/([^/]+)/);
        if (match && match[1]) {
          const slug = match[1];
          clicksMap[slug] = (clicksMap[slug] || 0) + group._count.id;
        }
      }
    });

    // 5. Process per-blog detailed analytics strictly from tracked database events
    const blogAnalytics = blogs.map((blog) => {
      const realClicks = (clicksMap[blog.id] || 0) + (clicksMap[blog.slug] || 0);
      const blogViews = blog.views || 0;
      const blogCtr = blogViews > 0 ? ((realClicks / blogViews) * 100).toFixed(1) : '0.0';

      return {
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        status: blog.status,
        categoryName: blog.category?.name || 'Uncategorized',
        views: blogViews,
        affiliateClicks: realClicks,
        ctr: `${blogCtr}%`,
        createdAt: blog.createdAt,
        productName: blog.product?.name || null,
        productPrice: blog.product?.price || null,
        featuredImage: blog.featuredImage,
      };
    });

    // 6. Top Blogs from Database
    const topBlogs = await db.blog.findMany({
      take: 5,
      orderBy: { views: 'desc' },
      select: { id: true, title: true, slug: true, views: true },
    });

    // 7. Top Products from Database
    const topProducts = await db.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, slug: true, price: true, brand: true },
    });

    return NextResponse.json({
      totalVisitors: totalPageViews,
      todayVisitors: todayVisitors,
      monthlyVisitors: monthlyVisitors,
      blogViews: blogViewsCount,
      productViews: productViewsCount,
      affiliateClicks: totalAffiliateClicks,
      ctr: `${ctr}%`,
      totalProducts: totalProductsCount,
      publishedBlogs: publishedBlogsCount,
      draftBlogs: draftBlogsCount,
      reviewBlogs: reviewBlogsCount,
      approvedBlogs: approvedBlogsCount,
      scheduledBlogs: scheduledBlogsCount,
      researchQueueCount: researchQueueCount,
      stalePricesCount: stalePricesCount,
      totalCategories: totalCategoriesCount,
      totalMedia: totalMediaCount,
      topBlogs,
      topProducts,
      blogAnalytics,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
