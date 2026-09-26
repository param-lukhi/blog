import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import { sendEmail, getEmailProviderStatus } from '@/lib/email/provider';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const digests = await prisma.newsletterDigest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    const subscriberCount = await prisma.newsletterSubscriber.count({
      where: { status: 'SUBSCRIBED' },
    });
    const emailProvider = getEmailProviderStatus();

    return NextResponse.json({
      success: true,
      digests,
      subscriberCount,
      emailProvider,
    });
  } catch (error: any) {
    console.error('[Newsletter Digest GET Error]', error);
    return NextResponse.json({ error: 'Failed to load newsletter digests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 1. Fetch real recent published articles
    const recentArticles = await prisma.blog.findMany({
      where: {
        status: 'PUBLISHED',
        createdAt: { gte: sevenDaysAgo },
      },
      select: { id: true, title: true, slug: true, metaDescription: true },
      take: 5,
    });

    // 2. Fetch products with active discounts / verified prices
    const dealProducts = await prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        isDeal: true,
      },
      select: { id: true, name: true, slug: true, price: true, brand: true },
      take: 4,
    });

    // 3. Fetch recent comparisons
    const comparisons = await prisma.comparison.findMany({
      where: { status: 'PUBLISHED' },
      take: 3,
      orderBy: { createdAt: 'desc' },
    });

    const issueDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const title = `BlogWeb904 Weekly Digest — ${issueDate}`;
    const subject = `🔥 This Week's Tech Reviews & Best Verified Deals (${issueDate})`;
    const previewText = `Check out our latest hands-on buying guides, head-to-head comparisons, and verified merchant deals.`;

    // 4. Generate structured HTML template
    let contentHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
        <div style="background-color: #0f172a; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px;">BlogWeb904 Weekly Digest</h1>
          <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0 0;">Verified Tech Research, Head-to-Head Comparisons & Price Tracking</p>
        </div>
        <div style="padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-top: none;">
          <h2 style="font-size: 16px; color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 6px;">📰 Latest Product Research & Reviews</h2>
    `;

    if (recentArticles.length > 0) {
      recentArticles.forEach((art: any) => {
        contentHtml += `
          <div style="margin-bottom: 16px;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px;">
              <a href="https://blogweb904.vercel.app/blog/${art.slug}" style="color: #2563eb; text-decoration: none; font-weight: bold;">${art.title}</a>
            </h3>
            <p style="margin: 0; font-size: 12px; color: #64748b;">${art.metaDescription || 'Detailed product specifications and multi-store price comparison.'}</p>
          </div>
        `;
      });
    } else {
      contentHtml += `<p style="font-size: 12px; color: #94a3b8;">Explore all our in-depth guides on the BlogWeb904 portal.</p>`;
    }

    if (dealProducts.length > 0) {
      contentHtml += `
        <h2 style="font-size: 16px; color: #0f172a; border-bottom: 2px solid #10b981; padding-bottom: 6px; margin-top: 24px;">🏷️ Current Verified Deals</h2>
      `;
      dealProducts.forEach((p: any) => {
        contentHtml += `
          <div style="margin-bottom: 10px; font-size: 13px;">
            <strong>${p.name}</strong> (${p.brand}) — <span style="color: #16a34a; font-weight: bold;">${p.price}</span>
            <br/><a href="https://blogweb904.vercel.app/products/${p.slug}" style="font-size: 11px; color: #2563eb;">View Store Prices &rarr;</a>
          </div>
        `;
      });
    }

    contentHtml += `
          <div style="margin-top: 24px; padding: 12px; background: #f8fafc; border-radius: 8px; font-size: 11px; color: #64748b; text-align: center;">
            <strong>Affiliate Disclosure:</strong> BlogWeb904 may earn a commission when you buy through links in our newsletter. Prices and stock are verified at time of publication.<br/>
            <a href="https://blogweb904.vercel.app/newsletter/unsubscribe" style="color: #94a3b8; text-decoration: underline; margin-top: 6px; display: inline-block;">Unsubscribe from Weekly Digest</a>
          </div>
        </div>
      </div>
    `;

    const metricsSnapshot = JSON.stringify({
      articlesIncluded: recentArticles.length,
      dealsIncluded: dealProducts.length,
      comparisonsIncluded: comparisons.length,
      generatedAt: new Date().toISOString(),
    });

    const newDigest = await prisma.newsletterDigest.create({
      data: {
        title,
        subject,
        previewText,
        contentHtml,
        status: 'DRAFT',
        metrics: metricsSnapshot,
      },
    });

    await logActivity({
      action: 'CREATE',
      entity: 'BLOG',
      entityId: newDigest.id,
      details: {
        summary: `Generated weekly newsletter digest draft: "${title}"`,
      },
    });

    return NextResponse.json({
      success: true,
      digest: newDigest,
    });
  } catch (error: any) {
    console.error('[Generate Digest Error]', error);
    return NextResponse.json({ error: 'Failed to generate weekly newsletter digest draft' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { digestId, action, subject, contentHtml } = body;

    if (!digestId) {
      return NextResponse.json({ error: 'Digest ID is required' }, { status: 400 });
    }

    const digest = await prisma.newsletterDigest.findUnique({ where: { id: digestId } });
    if (!digest) {
      return NextResponse.json({ error: 'Digest not found' }, { status: 404 });
    }

    if (action === 'APPROVE') {
      const updated = await prisma.newsletterDigest.update({
        where: { id: digestId },
        data: {
          status: 'REVIEWED',
          subject: subject || digest.subject,
          contentHtml: contentHtml || digest.contentHtml,
          updatedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, digest: updated });
    }

    if (action === 'SEND') {
      const subscribers = await prisma.newsletterSubscriber.findMany({
        where: { status: 'SUBSCRIBED' },
      });

      const providerStatus = getEmailProviderStatus();
      if (!providerStatus.configured) {
        // Safe mock delivery for unconfigured environment
        const updated = await prisma.newsletterDigest.update({
          where: { id: digestId },
          data: {
            status: 'SENT',
            recipientCount: subscribers.length,
            sentAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          message: `Digest marked as SENT. (Simulated delivery to ${subscribers.length} subscribers; Email provider NOT CONFIGURED in environment)`,
          digest: updated,
        });
      }

      // If configured, dispatch to subscribers
      for (const sub of subscribers) {
        await sendEmail({
          to: sub.email,
          subject: digest.subject,
          html: digest.contentHtml,
        });
      }

      const updated = await prisma.newsletterDigest.update({
        where: { id: digestId },
        data: {
          status: 'SENT',
          recipientCount: subscribers.length,
          sentAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Digest sent to ${subscribers.length} subscribers via ${providerStatus.provider}.`,
        digest: updated,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[Newsletter Digest PATCH Error]', error);
    return NextResponse.json({ error: 'Failed to update newsletter digest' }, { status: 500 });
  }
}
