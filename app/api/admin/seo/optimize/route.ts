import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { generateSEOSuggestions } from "@/lib/seoOptimizer";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const blogId = searchParams.get("blogId");

    if (blogId) {
      const blog = await db.blog.findUnique({
        where: { id: blogId },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          product: { select: { id: true, name: true, brand: true, slug: true } },
        },
      });

      if (!blog) {
        return NextResponse.json({ error: "Blog not found" }, { status: 404 });
      }

      const [relatedProds, relatedBlogs] = await Promise.all([
        db.product.findMany({
          where: { categoryId: blog.categoryId, id: { not: blog.productId || "" } },
          select: { id: true, name: true, slug: true },
          take: 3,
        }),
        db.blog.findMany({
          where: { categoryId: blog.categoryId, id: { not: blog.id }, status: "PUBLISHED" },
          select: { id: true, title: true, slug: true },
          take: 3,
        }),
      ]);

      const report = generateSEOSuggestions({
        blogId: blog.id,
        title: blog.title,
        currentMetaTitle: blog.metaTitle,
        currentMetaDescription: blog.metaDescription,
        currentSlug: blog.slug,
        content: blog.content,
        productName: blog.product?.name,
        brand: blog.product?.brand,
        categoryName: blog.category?.name,
        relatedEntities: {
          products: relatedProds,
          blogs: relatedBlogs,
        },
      });

      return NextResponse.json({ success: true, report });
    }

    // Return SEO optimization checklist for all blogs
    const blogs = await db.blog.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        metaTitle: true,
        metaDescription: true,
        content: true,
        status: true,
        updatedAt: true,
        category: { select: { name: true } },
        product: { select: { name: true, brand: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 30,
    });

    const reports = blogs.map((b: any) =>
      generateSEOSuggestions({
        blogId: b.id,
        title: b.title,
        currentMetaTitle: b.metaTitle,
        currentMetaDescription: b.metaDescription,
        currentSlug: b.slug,
        content: b.content,
        productName: b.product?.name,
        brand: b.product?.brand,
        categoryName: b.category?.name,
      })
    );

    return NextResponse.json({ success: true, reports });
  } catch (error: any) {
    console.error("[SEO Optimize API] Error:", error);
    return NextResponse.json({ error: "Failed to generate SEO suggestions" }, { status: 500 });
  }
}

// POST endpoint to Human-Approve & Apply selected SEO optimizations
export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { blogId, metaTitle, metaDescription, slug, h1 } = body;

    if (!blogId) {
      return NextResponse.json({ error: "blogId is required" }, { status: 400 });
    }

    const existing = await db.blog.findUnique({ where: { id: blogId } });
    if (!existing) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle.trim();
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription.trim();
    if (slug !== undefined && slug.trim()) {
      const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
      // Ensure unique slug
      const slugTaken = await db.blog.findFirst({
        where: { slug: cleanSlug, id: { not: blogId } },
      });
      if (!slugTaken) {
        updateData.slug = cleanSlug;
      }
    }

    const updated = await db.blog.update({
      where: { id: blogId },
      data: updateData,
    });

    await logActivity({
      action: "SEO_METADATA_APPROVED",
      entity: "Blog",
      entityId: blogId,
      details: {
        title: existing.title,
        updatedFields: Object.keys(updateData),
      },
    });

    return NextResponse.json({ success: true, blog: updated });
  } catch (error: any) {
    console.error("[SEO Apply API] Error:", error);
    return NextResponse.json({ error: "Failed to apply approved SEO metadata" }, { status: 500 });
  }
}
