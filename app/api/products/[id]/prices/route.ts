import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const prices = await db.productPrice.findMany({
      where: { productId: params.id },
      include: {
        history: {
          orderBy: { checkedAt: 'desc' },
          take: 20,
        },
      },
      orderBy: { price: 'asc' },
    });
    return NextResponse.json(prices);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch store prices' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { prices } = body; // Array of store price objects

    if (!Array.isArray(prices)) {
      return NextResponse.json({ error: 'Prices array is required' }, { status: 400 });
    }

    // Verify product exists
    const product = await db.product.findUnique({ where: { id: params.id } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Upsert or replace store prices for this product & record history
    for (const item of prices) {
      if (!item.storeName || !item.storeSlug) continue;

      const numPrice = item.price !== null && item.price !== undefined && item.price !== ''
        ? parseFloat(String(item.price).replace(/[^0-9.]/g, ''))
        : null;

      const numOriginalPrice = item.originalPrice !== null && item.originalPrice !== undefined && item.originalPrice !== ''
        ? parseFloat(String(item.originalPrice).replace(/[^0-9.]/g, ''))
        : null;

      let discount = item.discount ? parseFloat(String(item.discount).replace(/[^0-9.]/g, '')) : null;
      if (!discount && numPrice && numOriginalPrice && numOriginalPrice > numPrice) {
        discount = Math.round(((numOriginalPrice - numPrice) / numOriginalPrice) * 100);
      }

      const existing = await db.productPrice.findFirst({
        where: { productId: params.id, storeSlug: item.storeSlug },
      });

      let savedPriceRecordId: string;

      if (existing) {
        const updated = await db.productPrice.update({
          where: { id: existing.id },
          data: {
            storeName: String(item.storeName).trim(),
            price: numPrice,
            originalPrice: numOriginalPrice,
            currency: item.currency ? String(item.currency).trim() : 'INR',
            discount,
            inStock: item.inStock !== undefined ? Boolean(item.inStock) : true,
            couponCode: item.couponCode ? String(item.couponCode).trim() : null,
            offerText: item.offerText ? String(item.offerText).trim() : null,
            productUrl: item.productUrl ? String(item.productUrl).trim() : null,
            affiliateUrl: item.affiliateUrl ? String(item.affiliateUrl).trim() : null,
            lastCheckedAt: new Date(),
          },
        });
        savedPriceRecordId = updated.id;
      } else {
        const created = await db.productPrice.create({
          data: {
            productId: params.id,
            storeName: String(item.storeName).trim(),
            storeSlug: String(item.storeSlug).trim().toLowerCase(),
            price: numPrice,
            originalPrice: numOriginalPrice,
            currency: item.currency ? String(item.currency).trim() : 'INR',
            discount,
            inStock: item.inStock !== undefined ? Boolean(item.inStock) : true,
            couponCode: item.couponCode ? String(item.couponCode).trim() : null,
            offerText: item.offerText ? String(item.offerText).trim() : null,
            productUrl: item.productUrl ? String(item.productUrl).trim() : null,
            affiliateUrl: item.affiliateUrl ? String(item.affiliateUrl).trim() : null,
            lastCheckedAt: new Date(),
          },
        });
        savedPriceRecordId = created.id;
      }

      // Record in PriceHistory if price is available
      if (numPrice !== null) {
        await db.priceHistory.create({
          data: {
            productPriceId: savedPriceRecordId,
            price: numPrice,
            originalPrice: numOriginalPrice,
            currency: item.currency ? String(item.currency).trim() : 'INR',
            inStock: item.inStock !== undefined ? Boolean(item.inStock) : true,
            checkedAt: new Date(),
          },
        });
      }
    }

    await logActivity({
      action: 'PRICE_UPDATED',
      entity: 'Product',
      entityId: product.id,
      details: { productName: product.name, storeCount: prices.length },
    });

    try {
      revalidatePath(`/product/${product.slug}`);
      revalidatePath('/products');
      revalidatePath('/comparisons');
      revalidatePath('/');
    } catch (_) {}

    const updatedPrices = await db.productPrice.findMany({
      where: { productId: params.id },
      include: {
        history: {
          orderBy: { checkedAt: 'desc' },
          take: 20,
        },
      },
      orderBy: { price: 'asc' },
    });

    return NextResponse.json({ success: true, prices: updatedPrices });
  } catch (error) {
    console.error('Error saving store prices:', error);
    return NextResponse.json({ error: 'Failed to update store prices' }, { status: 500 });
  }
}

