import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const isAuth = isAuthorizedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get stale threshold from Setting or default 7 days
    const staleSetting = await db.setting.findUnique({
      where: { key: "price_stale_days" },
    });
    const staleDays = staleSetting ? parseInt(staleSetting.value) || 7 : 7;
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - staleDays);

    const storePrices = await db.productPrice.findMany({
      include: {
        product: {
          select: { id: true, name: true, slug: true, category: true, images: true },
        },
        history: {
          orderBy: { checkedAt: "desc" },
          take: 5,
        },
      },
      orderBy: { lastCheckedAt: "asc" },
    });

    let freshCount = 0;
    let staleCount = 0;

    const formatted = storePrices.map((p: any) => {
      const isStale = !p.lastCheckedAt || new Date(p.lastCheckedAt) < thresholdDate;
      if (isStale) staleCount++;
      else freshCount++;

      return {
        ...p,
        isStale,
        status: isStale ? "Needs verification" : "Fresh",
      };
    });

    return NextResponse.json({
      staleDaysThreshold: staleDays,
      summary: {
        total: storePrices.length,
        fresh: freshCount,
        stale: staleCount,
      },
      prices: formatted,
    });
  } catch (error: any) {
    console.error("[Price Verify API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch price verification data" }, { status: 500 });
  }
}

// POST endpoint to verify/refresh price for a specific productPriceId
export async function POST(req: NextRequest) {
  const isAuth = isAuthorizedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { productPriceId, newPrice, newOriginalPrice, inStock, notes } = body;

    if (!productPriceId) {
      return NextResponse.json({ error: "productPriceId is required" }, { status: 400 });
    }

    const existing = await db.productPrice.findUnique({
      where: { id: productPriceId },
      include: { product: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Store price not found" }, { status: 404 });
    }

    const priceToSet = newPrice !== undefined && newPrice !== null && newPrice !== ""
      ? parseFloat(String(newPrice).replace(/[^0-9.]/g, ""))
      : existing.price;

    const originalPriceToSet = newOriginalPrice !== undefined && newOriginalPrice !== null && newOriginalPrice !== ""
      ? parseFloat(String(newOriginalPrice).replace(/[^0-9.]/g, ""))
      : existing.originalPrice;

    const inStockToSet = inStock !== undefined ? Boolean(inStock) : existing.inStock;

    let discount = existing.discount;
    if (priceToSet && originalPriceToSet && originalPriceToSet > priceToSet) {
      discount = Math.round(((originalPriceToSet - priceToSet) / originalPriceToSet) * 100);
    }

    const updated = await db.productPrice.update({
      where: { id: productPriceId },
      data: {
        price: priceToSet,
        originalPrice: originalPriceToSet,
        discount,
        inStock: inStockToSet,
        lastCheckedAt: new Date(),
      },
    });

    // Record in history
    if (priceToSet !== null) {
      await db.priceHistory.create({
        data: {
          productPriceId: updated.id,
          price: priceToSet,
          originalPrice: originalPriceToSet,
          currency: updated.currency,
          inStock: inStockToSet,
          checkedAt: new Date(),
        },
      });
    }

    await logActivity({
      action: "PRICE_VERIFIED",
      entity: "ProductPrice",
      entityId: updated.id,
      details: {
        productName: existing.product?.name,
        storeName: existing.storeName,
        price: priceToSet,
        notes: notes || "Verified by admin",
      },
    });

    return NextResponse.json({ success: true, price: updated });
  } catch (error: any) {
    console.error("[Price Verify API] Error updating verification:", error);
    return NextResponse.json({ error: "Failed to verify price" }, { status: 500 });
  }
}
