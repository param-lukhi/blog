import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Unsubscribe token is required" }, { status: 400 });
    }

    const alert = await db.priceAlert.findUnique({
      where: { token },
      include: { product: { select: { name: true } } },
    });

    if (!alert) {
      return NextResponse.json({ error: "Invalid or expired unsubscribe link." }, { status: 404 });
    }

    await db.priceAlert.update({
      where: { id: alert.id },
      data: {
        isSubscribed: false,
        status: "CANCELLED",
      },
    });

    await logActivity({
      action: "PRICE_ALERT_UNSUBSCRIBED",
      entity: "PriceAlert",
      entityId: alert.id,
      details: {
        productName: alert.product?.name,
      },
    });

    return NextResponse.json({
      success: true,
      message: `You have successfully unsubscribed from price drop alerts for ${alert.product?.name || "this product"}.`,
    });
  } catch (error: any) {
    console.error("[Price Alert Unsubscribe API] Error:", error);
    return NextResponse.json({ error: "Failed to process unsubscribe request" }, { status: 500 });
  }
}
