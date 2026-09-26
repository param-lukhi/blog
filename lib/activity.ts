import { db } from "@/lib/db";
import { headers } from "next/headers";

export interface LogActivityParams {
  action: string;
  entity: string;
  entityId?: string | null;
  adminEmail?: string | null;
  details?: Record<string, any> | null;
}

/**
 * Server-side helper to record admin activity audit trail.
 * Never logs sensitive credentials, keys, or passwords.
 */
export async function logActivity(params: LogActivityParams) {
  try {
    let ipAddress: string | null = null;
    try {
      const headerList = headers();
      ipAddress = headerList.get("x-forwarded-for") || headerList.get("x-real-ip") || null;
      if (ipAddress && ipAddress.includes(",")) {
        ipAddress = ipAddress.split(",")[0].trim();
      }
    } catch {
      // In standalone scripts or non-request context, headers() might not be available
      ipAddress = "system";
    }

    await db.activityLog.create({
      data: {
        userName: params.adminEmail ? params.adminEmail.split("@")[0] : "Admin",
        userEmail: params.adminEmail || "admin@blogweb904.com",
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        summary: params.details?.summary || `${params.action} on ${params.entity}`,
        metadata: params.details ? JSON.stringify(params.details) : null,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error("[ActivityLog] Failed to record activity:", error);
    // Don't fail the parent operation if logging fails
  }
}
