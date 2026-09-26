import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const alerts = await db.priceAlert.findMany({
      include: {
        product: {
          select: { id: true, name: true, slug: true, price: true, brand: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const summary = {
      totalAlerts: alerts.length,
      activeAlerts: alerts.filter((a: any) => a.status === "ACTIVE" && a.isSubscribed).length,
      triggeredAlerts: alerts.filter((a: any) => a.status === "TRIGGERED").length,
    };

    return NextResponse.json({
      success: true,
      summary,
      alerts,
    });
  } catch (error: any) {
    console.error("[Price Alert API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch price alerts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, productId, targetPrice, storeSlug = "amazon" } = body;

    if (!email || !productId || !targetPrice) {
      return NextResponse.json(
        { error: "Email, productId, and targetPrice are required." },
        { status: 400 }
      );
    }

    // Basic email sanity check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const parsedTarget = parseFloat(String(targetPrice).replace(/[^0-9.]/g, ""));
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      return NextResponse.json({ error: "Please enter a valid target price amount." }, { status: 400 });
    }

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: productId },
      include: { prices: { where: { storeSlug } } },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const currentPrice = product.prices[0]?.price || null;

    // Check for existing active alert for same email & product
    const existing = await db.priceAlert.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        productId,
        storeSlug,
        status: "ACTIVE",
      },
    });

    if (existing) {
      // Update target price
      const updated = await db.priceAlert.update({
        where: { id: existing.id },
        data: {
          targetPrice: parsedTarget,
          currentPrice,
          isSubscribed: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Your price alert subscription has been updated.",
        alertId: updated.id,
      });
    }

    const newAlert = await db.priceAlert.create({
      data: {
        email: email.trim().toLowerCase(),
        productId,
        storeSlug,
        targetPrice: parsedTarget,
        currentPrice,
        status: "ACTIVE",
        isSubscribed: true,
      },
    });

    await logActivity({
      action: "PRICE_ALERT_CREATED",
      entity: "PriceAlert",
      entityId: newAlert.id,
      details: {
        productName: product.name,
        targetPrice: parsedTarget,
        store: storeSlug,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Price drop alert registered successfully! We will notify you when the price drops.",
      alertId: newAlert.id,
    });
  } catch (error: any) {
    console.error("[Price Alert API] Creation error:", error);
    return NextResponse.json({ error: "Failed to create price alert." }, { status: 500 });
  }
}
