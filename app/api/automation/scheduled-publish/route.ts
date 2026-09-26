import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  if (isAuthorizedAdmin()) return true;

  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || process.env.ADMIN_SESSION_SECRET;

  if (authHeader && cronSecret) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (token === cronSecret) return true;
  }

  const customHeader = req.headers.get("x-cron-secret");
  if (customHeader && cronSecret && customHeader === cronSecret) return true;

  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const scheduledBlogs = await db.blog.findMany({
      where: {
        status: "SCHEDULED",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        scheduledAt: true,
        createdAt: true,
      },
      orderBy: { scheduledAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      count: scheduledBlogs.length,
      scheduledBlogs,
    });
  } catch (error: any) {
    console.error("[Scheduled Publish API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch scheduled blogs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find all blogs that are scheduled and ready to be published
    const readyBlogs = await db.blog.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: {
          lte: now,
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        scheduledAt: true,
      },
    });

    let publishedCount = 0;
    for (const blog of readyBlogs) {
      await db.blog.update({
        where: { id: blog.id },
        data: {
          status: "PUBLISHED",
        },
      });

      await logActivity({
        action: "AUTO_PUBLISH",
        entity: "Blog",
        entityId: blog.id,
        details: {
          title: blog.title,
          scheduledAt: blog.scheduledAt,
          publishedAt: now,
        },
      });

      publishedCount++;
    }

    return NextResponse.json({
      success: true,
      publishedCount,
      publishedBlogs: readyBlogs,
    });
  } catch (error: any) {
    console.error("[Scheduled Publish API] Execution error:", error);
    return NextResponse.json({ error: "Failed to process scheduled publications" }, { status: 500 });
  }
}
