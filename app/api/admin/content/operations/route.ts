import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import { generateDailyRecommendations, evaluateContentQualityGate, getInventoryBalance } from '@/lib/contentOperations';
import { getDailyPublishingProgress } from '@/lib/publishingWorkflow';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const [recommendations, inventory, dailyProgress] = await Promise.all([
      generateDailyRecommendations(),
      getInventoryBalance(),
      getDailyPublishingProgress(),
    ]);

    return NextResponse.json({
      recommendations,
      inventory,
      dailyProgress,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch content operations data' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const evaluation = evaluateContentQualityGate({
      title: body.title || '',
      content: body.content || '',
      metaTitle: body.metaTitle || null,
      metaDescription: body.metaDescription || null,
      image: body.image || null,
      verifiedSourcesCount: Number(body.verifiedSourcesCount || 0),
      affiliateLinksCount: Number(body.affiliateLinksCount || 0),
      productReferencesCount: Number(body.productReferencesCount || 0),
      isHumanReviewed: Boolean(body.isHumanReviewed),
    });

    return NextResponse.json(evaluation);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to evaluate quality gate' },
      { status: 400 }
    );
  }
}
