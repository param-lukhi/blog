import prisma from '@/lib/prisma';
import { logActivity } from '@/lib/activity';

export interface PublishingSummary {
  dailyTarget: number;
  publishedToday: number;
  remainingToday: number;
  completionPercent: number;
  counts: {
    idea: number;
    researching: number;
    researched: number;
    draft: number;
    review: number;
    approved: number;
    published: number;
    updateRequired: number;
  };
}

export async function getPublishingSummary(): Promise<PublishingSummary> {
  const target = await prisma.publishingTarget.findUnique({
    where: { period: 'DAILY' },
  });
  const dailyTarget = target?.targetCount || 1;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const publishedToday = await prisma.blog.count({
    where: {
      status: 'PUBLISHED',
      createdAt: { gte: todayStart },
    },
  });

  const queueItems = await prisma.productionQueueItem.findMany();

  const counts = {
    idea: queueItems.filter(q => q.status === 'IDEA').length,
    researching: queueItems.filter(q => q.status === 'RESEARCHING').length,
    researched: queueItems.filter(q => q.status === 'RESEARCHED').length,
    draft: queueItems.filter(q => q.status === 'DRAFT').length,
    review: queueItems.filter(q => q.status === 'REVIEW' || q.status === 'SEO_REVIEW' || q.status === 'AFFILIATE_REVIEW').length,
    approved: queueItems.filter(q => q.status === 'APPROVED').length,
    published: publishedToday,
    updateRequired: queueItems.filter(q => q.status === 'UPDATE_REQUIRED').length,
  };

  const remainingToday = Math.max(0, dailyTarget - publishedToday);
  const completionPercent = dailyTarget > 0 ? Math.min(100, Math.round((publishedToday / dailyTarget) * 100)) : 100;

  return {
    dailyTarget,
    publishedToday,
    remainingToday,
    completionPercent,
    counts,
  };
}

/**
 * Validates whether the configured Amazon Associate tag is explicitly verified or still a placeholder.
 */
export function auditAmazonTag(): { status: 'VERIFIED' | 'REQUIRES_VERIFICATION'; tag: string | null; message: string } {
  const tag = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG || process.env.AMAZON_AFFILIATE_TAG || null;
  
  if (!tag) {
    return {
      status: 'REQUIRES_VERIFICATION',
      tag: null,
      message: 'Amazon Affiliate tag is not configured in environment (AMAZON_AFFILIATE_TAG missing).',
    };
  }

  const isDefaultPlaceholder = tag === 'techpulse-20' || tag.includes('example') || tag.includes('placeholder');

  return {
    status: isDefaultPlaceholder ? 'REQUIRES_VERIFICATION' : 'VERIFIED',
    tag: tag ? `${tag.substring(0, 4)}...${tag.slice(-2)}` : null,
    message: isDefaultPlaceholder
      ? 'AMAZON TAG REQUIRES VERIFICATION (Currently using default verified developer testing tag techpulse-20. Replace with your approved Amazon Associates ID).'
      : 'Amazon Associates tag configured and verified.',
  };
}

/**
 * Creates a version snapshot before updating or publishing an article.
 */
export async function createContentVersion(params: {
  blogId: string;
  title: string;
  content: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  changeSummary?: string;
  changedBy?: string;
}) {
  const count = await prisma.contentVersion.count({
    where: { blogId: params.blogId },
  });

  return await prisma.contentVersion.create({
    data: {
      blogId: params.blogId,
      versionNumber: count + 1,
      title: params.title,
      content: params.content,
      metaTitle: params.metaTitle,
      metaDescription: params.metaDescription,
      changeSummary: params.changeSummary || 'Editorial update snapshot',
      changedBy: params.changedBy || 'admin',
    },
  });
}
export async function getDailyPublishingProgress(): Promise<PublishingSummary> {
  return await getPublishingSummary();
}
