import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/auth";
import { auditContentSEO, getSearchConsoleStatus } from "@/lib/seoHealth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const isAuth = isAuthorizedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [blogs, products, categories, comparisons] = await Promise.all([
      db.blog.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          metaTitle: true,
          metaDescription: true,
          content: true,
          featuredImage: true,
          affiliateUrl: true,
          status: true,
        },
      }),
      db.product.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
          specifications: true,
          status: true,
        },
      }),
      db.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
        },
      }),
      db.comparison.findMany({
        where: { status: "PUBLISHED" },
        select: { id: true, title: true, slug: true },
      }),
    ]);

    const audit = auditContentSEO(blogs, products, categories);

    const sitemapEntities = {
      publishedBlogs: blogs.filter((b: any) => b.status === "PUBLISHED").length,
      publishedProducts: products.filter((p: any) => p.status === "PUBLISHED").length,
      categories: categories.length,
      comparisons: comparisons.length,
      totalSitemapUrls:
        blogs.filter((b: any) => b.status === "PUBLISHED").length +
        products.filter((p: any) => p.status === "PUBLISHED").length +
        categories.length +
        comparisons.length +
        11, // static pages
    };

    return NextResponse.json({
      success: true,
      audit,
      sitemap: sitemapEntities,
      searchConsole: getSearchConsoleStatus(),
    });
  } catch (error: any) {
    console.error("[SEO Admin API] Error:", error);
    return NextResponse.json({ error: "Failed to run SEO audit" }, { status: 500 });
  }
}
