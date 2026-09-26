import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyAffiliateWebhook } from '@/lib/affiliateWebhook';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-affiliate-signature') || req.headers.get('x-signature');
    const authHeader = req.headers.get('authorization') || req.headers.get('x-webhook-secret');

    // 1. Webhook Authentication
    const verification = verifyAffiliateWebhook(rawBody, signature, authHeader);
    if (!verification.isValid) {
      return NextResponse.json(
        { error: 'Unauthorized webhook request', reason: verification.reason },
        { status: 401 }
      );
    }

    // 2. Parse & Validate Payload
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const {
      storeSlug = 'amazon',
      externalTransactionId,
      productId,
      blogId,
      clickId,
      amount,
      commission,
      currency = 'INR',
      status = 'PENDING',
      convertedAt,
    } = payload;

    if (commission === undefined || commission === null || isNaN(Number(commission))) {
      return NextResponse.json({ error: 'Commission amount is required and must be numeric' }, { status: 400 });
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED'];
    const normalizedStatus = validStatuses.includes(status.toUpperCase())
      ? status.toUpperCase()
      : 'PENDING';

    const parsedConvertedAt = convertedAt ? new Date(convertedAt) : new Date();

    // 3. Duplicate Protection (Idempotency)
    let conversionRecord: any;
    let isDuplicate = false;

    if (externalTransactionId) {
      const existing = await prisma.affiliateConversion.findUnique({
        where: { externalTransactionId: String(externalTransactionId) },
      });

      if (existing) {
        // Update existing conversion without double-counting
        conversionRecord = await prisma.affiliateConversion.update({
          where: { id: existing.id },
          data: {
            status: normalizedStatus,
            amount: amount !== undefined ? Number(amount) : existing.amount,
            commission: Number(commission),
            currency,
            updatedAt: new Date(),
          },
        });
        isDuplicate = true;
      }
    }

    if (!conversionRecord) {
      conversionRecord = await prisma.affiliateConversion.create({
        data: {
          storeSlug: String(storeSlug).toLowerCase(),
          externalTransactionId: externalTransactionId ? String(externalTransactionId) : undefined,
          productId: productId ? String(productId) : undefined,
          blogId: blogId ? String(blogId) : undefined,
          clickId: clickId ? String(clickId) : undefined,
          amount: amount !== undefined ? Number(amount) : null,
          commission: Number(commission),
          currency,
          status: normalizedStatus,
          convertedAt: parsedConvertedAt,
        },
      });
    }

    // 4. Log in Activity Log
    await logActivity({
      action: isDuplicate ? 'UPDATE_CONVERSION' : 'CREATE_CONVERSION',
      entity: 'STORE',
      entityId: conversionRecord.id,
      details: {
        summary: `Affiliate conversion ${isDuplicate ? 'updated' : 'recorded'}: ${storeSlug} | Status: ${normalizedStatus} | Commission: ${currency} ${commission}`,
        externalTransactionId,
        storeSlug,
        status: normalizedStatus,
        commission,
        productId,
      },
    });

    return NextResponse.json({
      success: true,
      action: isDuplicate ? 'updated' : 'created',
      conversion: {
        id: conversionRecord.id,
        externalTransactionId: conversionRecord.externalTransactionId,
        status: conversionRecord.status,
        commission: conversionRecord.commission,
        currency: conversionRecord.currency,
      },
    });
  } catch (error: any) {
    console.error('[Affiliate Webhook Error]', error);
    return NextResponse.json({ error: 'Internal server error processing conversion webhook' }, { status: 500 });
  }
}
