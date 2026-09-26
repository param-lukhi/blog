import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { getStoreAdapter } from "@/lib/stores/adapters";

export const dynamic = "force-dynamic";

/**
 * Check if the request is authorized via Cron Secret or Admin Session
 */
function isAuthorizedSyncRequest(req: NextRequest): boolean {
  // 1. Check Admin Cookie / Session
  if (isAuthorizedAdmin()) {
    return true;
  }

  // 2. Check Bearer Token (Vercel Cron / Scheduler)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || process.env.ADMIN_SESSION_SECRET;

  if (authHeader && cronSecret) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (token === cronSecret) {
      return true;
    }
  }

  // 3. Check custom header x-cron-secret
  const customHeader = req.headers.get("x-cron-secret");
  if (customHeader && cronSecret && customHeader === cronSecret) {
    return true;
  }

  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedSyncRequest(req)) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing cron authentication token" },
      { status: 401 }
    );
  }

  try {
    const logs = await db.priceSyncLog.findMany({
      orderBy: { startedAt: "desc" },
      take: 20,
    });

    const activeStores = await db.store.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
    });

    return NextResponse.json({
      success: true,
      activeStores,
      recentSyncs: logs,
    });
  } catch (error: any) {
    console.error("[Price Sync API] Error fetching sync history:", error);
    return NextResponse.json({ error: "Failed to fetch sync logs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedSyncRequest(req)) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing cron authentication token" },
      { status: 401 }
    );
  }

  const runId = `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const startedAt = new Date();

  try {
    const body = await req.json().catch(() => ({}));
    const targetStoreSlug = body.storeSlug || "all";
    const maxItems = body.limit ? parseInt(String(body.limit)) : 50;

    // Load price entries needing update
    const whereClause: any = {};
    if (targetStoreSlug !== "all") {
      whereClause.storeSlug = targetStoreSlug;
    }

    const pricesToSync = await db.productPrice.findMany({
      where: whereClause,
      include: {
        product: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { lastCheckedAt: "asc" },
      take: maxItems,
    });

    // Create PriceSyncLog
    const syncLog = await db.priceSyncLog.create({
      data: {
        runId,
        storeSlug: targetStoreSlug,
        storeName: targetStoreSlug === "all" ? "All Active Stores" : targetStoreSlug,
        status: "RUNNING",
        productsChecked: pricesToSync.length,
        productsUpdated: 0,
        productsFailed: 0,
        startedAt,
      },
    });

    let updatedCount = 0;
    let failedCount = 0;
    const errorDetails: Array<{ id: string; store: string; error: string }> = [];

    for (const item of pricesToSync) {
      try {
        const adapter = getStoreAdapter(item.storeSlug);
        
        if (!adapter) {
          // No adapter configured for this store
          failedCount++;
          errorDetails.push({
            id: item.id,
            store: item.storeSlug,
            error: `No adapter implemented for store: ${item.storeSlug}`,
          });
          continue;
        }

        const adapterStatus = adapter.getStatus();
        if (adapterStatus.status !== "SUPPORTED") {
          // Adapter is NOT_CONFIGURED or UNAVAILABLE - touch lastCheckedAt safely without erasing price
          await db.productPrice.update({
            where: { id: item.id },
            data: { lastCheckedAt: new Date() },
          });

          failedCount++;
          errorDetails.push({
            id: item.id,
            store: item.storeSlug,
            error: adapterStatus.reason || "Store API credentials not configured",
          });
          continue;
        }

        // Retry loop (max 3 attempts with safe exponential backoff)
        let verifyResult: any = null;
        let attempt = 0;
        const maxRetries = 3;

        while (attempt < maxRetries) {
          attempt++;
          verifyResult = await adapter.fetchPrice(item.productUrl || "");
          if (verifyResult.success) break;
          if (attempt < maxRetries) {
            // Wait 100ms * attempt backoff
            await new Promise((r) => setTimeout(r, 100 * attempt));
          }
        }

        if (!verifyResult || !verifyResult.success) {
          // Store API failed - record failure, do NOT erase valid price with 0/null
          await db.productPrice.update({
            where: { id: item.id },
            data: { lastCheckedAt: new Date() },
          });

          failedCount++;
          errorDetails.push({
            id: item.id,
            store: item.storeSlug,
            error: verifyResult?.error || "Fetch failed after retries",
          });
          continue;
        }

        // Process successful price
        const newPrice = verifyResult.price;
        const oldPrice = item.price;
        const priceChanged = oldPrice !== null && newPrice !== null && oldPrice !== newPrice;

        const updated = await db.productPrice.update({
          where: { id: item.id },
          data: {
            price: newPrice !== undefined ? newPrice : item.price,
            originalPrice: verifyResult.originalPrice !== undefined ? verifyResult.originalPrice : item.originalPrice,
            inStock: verifyResult.inStock !== undefined ? verifyResult.inStock : item.inStock,
            discount: verifyResult.discount !== undefined ? verifyResult.discount : item.discount,
            lastCheckedAt: new Date(),
          },
        });

        // Append to PriceHistory
        if (newPrice !== null && newPrice !== undefined) {
          await db.priceHistory.create({
            data: {
              productPriceId: item.id,
              price: newPrice,
              originalPrice: updated.originalPrice,
              currency: updated.currency,
              inStock: updated.inStock,
              checkedAt: new Date(),
            },
          });
        }

        // Log PRICE_CHANGED if detected
        if (priceChanged && oldPrice !== null && newPrice !== null) {
          const diff = newPrice - oldPrice;
          const pct = Math.round((diff / oldPrice) * 100 * 10) / 10;

          await logActivity({
            action: "PRICE_CHANGED",
            entity: "ProductPrice",
            entityId: item.id,
            details: {
              productName: item.product?.name,
              store: item.storeName,
              oldPrice,
              newPrice,
              difference: diff,
              percentageChange: `${pct > 0 ? "+" : ""}${pct}%`,
            },
          });
        }

        updatedCount++;
      } catch (err: any) {
        failedCount++;
        errorDetails.push({
          id: item.id,
          store: item.storeSlug,
          error: err.message || "Unknown error during verification",
        });
      }
    }

    // Determine final job status
    let finalStatus = "COMPLETED";
    if (failedCount > 0 && updatedCount > 0) {
      finalStatus = "PARTIAL";
    } else if (failedCount > 0 && updatedCount === 0 && pricesToSync.length > 0) {
      finalStatus = "FAILED";
    }

    // Update PriceSyncLog
    const completedLog = await db.priceSyncLog.update({
      where: { id: syncLog.id },
      data: {
        status: finalStatus,
        productsUpdated: updatedCount,
        productsFailed: failedCount,
        errors: errorDetails.length > 0 ? JSON.stringify(errorDetails.slice(0, 10)) : null,
        completedAt: new Date(),
      },
    });

    await logActivity({
      action: "PRICE_SYNC_JOB",
      entity: "PriceSyncLog",
      entityId: syncLog.id,
      details: {
        runId,
        store: targetStoreSlug,
        status: finalStatus,
        checked: pricesToSync.length,
        updated: updatedCount,
        failed: failedCount,
      },
    });

    return NextResponse.json({
      success: true,
      runId,
      status: finalStatus,
      summary: {
        checked: pricesToSync.length,
        updated: updatedCount,
        failed: failedCount,
      },
      log: completedLog,
    });
  } catch (error: any) {
    console.error("[Price Sync API] Job failed:", error);
    return NextResponse.json(
      { error: "Price synchronization job encountered a critical error" },
      { status: 500 }
    );
  }
}
