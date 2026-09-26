import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import crypto from 'crypto';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      select: { id: true, name: true, slug: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // 1. Fetch only APPROVED reviews for public display
    const reviews = await prisma.productReview.findMany({
      where: {
        productId: product.id,
        status: 'APPROVED',
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        authorName: true,
        rating: true,
        title: true,
        content: true,
        isVerifiedBuyer: true,
        createdAt: true,
      },
    });

    // 2. Compute authentic rating distribution & average
    const totalReviews = reviews.length;
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    reviews.forEach((r: any) => {
      if (distribution[r.rating] !== undefined) {
        distribution[r.rating] += 1;
      }
      sum += r.rating;
    });

    const averageRating = totalReviews > 0 ? Number((sum / totalReviews).toFixed(1)) : 0;

    return NextResponse.json({
      success: true,
      totalReviews,
      averageRating,
      distribution,
      reviews,
    });
  } catch (error: any) {
    console.error('[Product Reviews GET Error]', error);
    return NextResponse.json({ error: 'Failed to load community reviews' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';
    const rateLimitKey = `review:${ip}`;
    if (!checkRateLimit(rateLimitKey, 5, 3600000)) { // 5 reviews per hour max
      return NextResponse.json(
        { error: 'Too many reviews submitted. Please try again later.' },
        { status: 429 }
      );
    }

    const { id } = params;
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      select: { id: true, name: true, slug: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const body = await req.json();
    const { authorName, email, rating, title, content } = body;

    if (!authorName || authorName.trim().length < 2) {
      return NextResponse.json({ error: 'Please enter a valid author name (at least 2 characters)' }, { status: 400 });
    }

    const numericRating = parseInt(rating, 10);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: 'Rating must be an integer between 1 and 5' }, { status: 400 });
    }

    if (!title || title.trim().length < 3) {
      return NextResponse.json({ error: 'Review title is required (at least 3 characters)' }, { status: 400 });
    }

    if (!content || content.trim().length < 10) {
      return NextResponse.json({ error: 'Review content must be at least 10 characters' }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: 'Review content exceeds 2,000 character limit' }, { status: 400 });
    }

    // Privacy & Anti-Spam hash
    const emailHash = email
      ? crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex')
      : null;

    // Check Verified Buyer status: ONLY set true if verified purchase data/conversion exists
    let isVerifiedBuyer = false;
    if (email) {
      const verifiedConversion = await prisma.affiliateConversion.findFirst({
        where: {
          productId: product.id,
          status: 'CONFIRMED',
        },
      });
      if (verifiedConversion) {
        isVerifiedBuyer = false; // Stay strict: verified badge only on authentic match
      }
    }

    // Create review in PENDING state for moderation
    const newReview = await prisma.productReview.create({
      data: {
        productId: product.id,
        authorName: authorName.trim(),
        email: email ? email.trim().toLowerCase() : null,
        userEmailHash: emailHash,
        rating: numericRating,
        title: title.trim(),
        content: content.trim(),
        status: 'PENDING',
        isVerifiedBuyer,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your review has been submitted and is currently pending editorial moderation.',
      reviewId: newReview.id,
    });
  } catch (error: any) {
    console.error('[Product Review POST Error]', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
