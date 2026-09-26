import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [
      products,
      blogs,
      pendingComments,
      totalComments,
      users,
      newsletterSubscribers,
      categories,
      brands,
      deals,
      comparisons,
      research,
    ] = await Promise.all([
      db.product.count(),
      db.blog.count(),
      db.comment.count({ where: { status: 'PENDING' } }),
      db.comment.count(),
      db.user.count(),
      db.newsletterSubscriber.count(),
      db.category.count(),
      db.brand.count(),
      db.deal.count(),
      db.comparison.count(),
      db.productResearch.count(),
    ]);

    return NextResponse.json({
      products,
      blogs,
      pendingComments,
      totalComments,
      users,
      newsletterSubscribers,
      categories,
      brands,
      deals,
      comparisons,
      research,
    });
  } catch (error) {
    console.error('Error fetching admin counts:', error);
    return NextResponse.json({ error: 'Failed to fetch admin counts' }, { status: 500 });
  }
}
