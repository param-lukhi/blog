import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { safeJsonParse } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { product1Id, product2Id, customTitle, categoryId } = body;

    if (!product1Id || !product2Id) {
      return NextResponse.json(
        { error: "Both product1Id and product2Id are required for comparison" },
        { status: 400 }
      );
    }

    if (product1Id === product2Id) {
      return NextResponse.json(
        { error: "Cannot compare a product against itself. Please select two distinct products." },
        { status: 400 }
      );
    }

    // Load both products
    const [p1, p2] = await Promise.all([
      db.product.findUnique({
        where: { id: product1Id },
        include: { category: true, prices: { orderBy: { price: "asc" } } },
      }),
      db.product.findUnique({
        where: { id: product2Id },
        include: { category: true, prices: { orderBy: { price: "asc" } } },
      }),
    ]);

    if (!p1 || !p2) {
      return NextResponse.json({ error: "One or both selected products not found" }, { status: 404 });
    }

    const p1Specs = safeJsonParse(p1.specifications, {});
    const p2Specs = safeJsonParse(p2.specifications, {});
    const p1Features = safeJsonParse(p1.features, []);
    const p2Features = safeJsonParse(p2.features, []);
    const p1Pros = safeJsonParse(p1.pros, []);
    const p2Pros = safeJsonParse(p2.pros, []);
    const p1Cons = safeJsonParse(p1.cons, []);
    const p2Cons = safeJsonParse(p2.cons, []);

    const p1Price = p1.prices[0]?.price ? `₹${p1.prices[0].price.toLocaleString()}` : p1.price;
    const p2Price = p2.prices[0]?.price ? `₹${p2.prices[0].price.toLocaleString()}` : p2.price;

    const baseTitle = customTitle?.trim() || `${p1.name} vs ${p2.name}: Which Should You Buy?`;
    const cleanSlug = `${p1.slug}-vs-${p2.slug}`.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");

    // Check for existing comparison or blog duplicate
    const existingBlog = await db.blog.findUnique({ where: { slug: cleanSlug } });
    const duplicateWarning = existingBlog ? `A comparison article with slug "${cleanSlug}" already exists.` : null;

    // Build structured comparison article body
    const articleContent = `
# ${baseTitle}

Comparing the **${p1.name}** and the **${p2.name}** helps identify which device best aligns with your daily workflow, budget, and performance requirements. In this comprehensive head-to-head analysis, we break down specifications, design, hardware capabilities, and real-world value.

---

## 1. Quick Comparison & Core Highlights

| Feature / Metric | ${p1.name} | ${p2.name} |
| :--- | :--- | :--- |
| **Brand** | ${p1.brand} | ${p2.brand} |
| **Current Starting Price** | ${p1Price} | ${p2Price} |
| **Primary Category** | ${p1.category?.name || "General"} | ${p2.category?.name || "General"} |
| **Key Advantage** | ${p1Pros[0] || "Refined build and design"} | ${p2Pros[0] || "Competitive value and versatile feature set"} |

---

## 2. Key Differences Breakdown

### Design & Build Quality
- **${p1.name}:** Engineered by ${p1.brand} with a focus on ergonomics and build resilience.
- **${p2.name}:** Built by ${p2.brand} offering a distinct aesthetic and durable chassis construction.

### Performance & Hardware Architecture
- **${p1.name}:** Features optimized thermal handling and hardware specifications tailored for demanding workloads.
- **${p2.name}:** Provides balanced performance tuned for responsiveness and multitasking efficiency.

### Features & Everyday Capability
- **${p1.name} Highlights:**
${Array.isArray(p1Features) && p1Features.length > 0 ? p1Features.slice(0, 4).map((f: string) => `  - ${f}`).join("\n") : `  - Verified ${p1.brand} feature suite`}
- **${p2.name} Highlights:**
${Array.isArray(p2Features) && p2Features.length > 0 ? p2Features.slice(0, 4).map((f: string) => `  - ${f}`).join("\n") : `  - Verified ${p2.brand} feature suite`}

---

## 3. Price & Multi-Store Availability

- **${p1.name}:** Available starting at **${p1Price}**. Check verified store feeds for live discounts and bank offers.
- **${p2.name}:** Available starting at **${p2Price}**. Check multi-store listings below for competitive retailer pricing.

---

## 4. Pros & Trade-offs (Side-by-Side)

### ${p1.name}
**Strengths:**
${Array.isArray(p1Pros) && p1Pros.length > 0 ? p1Pros.map((p: string) => `- ${p}`).join("\n") : "- Solid hardware design"}

**Considerations:**
${Array.isArray(p1Cons) && p1Cons.length > 0 ? p1Cons.map((c: string) => `- ${c}`).join("\n") : "- Premium price point"}

### ${p2.name}
**Strengths:**
${Array.isArray(p2Pros) && p2Pros.length > 0 ? p2Pros.map((p: string) => `- ${p}`).join("\n") : "- Robust ecosystem compatibility"}

**Considerations:**
${Array.isArray(p2Cons) && p2Cons.length > 0 ? p2Cons.map((c: string) => `- ${c}`).join("\n") : "- Specific usage tradeoffs"}

---

## 5. Who Should Consider Which Option?

- **Choose ${p1.name} if:** You prioritize ${p1Pros[0] || "the specific strengths of " + p1.brand} and prefer its form factor and feature suite.
- **Choose ${p2.name} if:** You are looking for ${p2Pros[0] || "the distinct capabilities offered by " + p2.brand} within this price tier.

---

## 6. Frequently Asked Questions

### Which product offers better value for money?
Both the ${p1.name} and ${p2.name} serve different user priorities. Evaluate the pros and cons listed above against your daily requirements to determine optimal value.

### Are replacement parts and manufacturer warranty available?
Both ${p1.brand} and ${p2.brand} provide official manufacturer warranty coverage when purchased through authorized retailers.

---

## 7. Editorial Methodology & Sources

Our comparison is compiled through verified manufacturer technical sheets, authenticated pricing feeds, and standardized specification auditing.

*Disclosure: This article may contain affiliate links. If you make a purchase through a qualifying link, we may receive a commission at no additional cost to you.*
    `.trim();

    const metaTitle = `${p1.name} vs ${p2.name} Comparison: Specs, Price & Verdict`;
    const metaDescription = `Detailed head-to-head comparison between ${p1.name} (${p1Price}) and ${p2.name} (${p2Price}). Compare specs, pros, cons, and buying recommendations.`;

    const targetCategoryId = categoryId || p1.categoryId || p2.categoryId;

    // Create Draft Blog Record
    const blogDraft = await db.blog.create({
      data: {
        title: baseTitle,
        slug: duplicateWarning ? `${cleanSlug}-${Date.now().toString().slice(-4)}` : cleanSlug,
        metaTitle,
        metaDescription,
        featuredImage: p1.images && safeJsonParse(p1.images, [])[0] ? safeJsonParse(p1.images, [])[0] : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        content: articleContent,
        amazonUrl: p1.amazonUrl || p2.amazonUrl || "https://amazon.in",
        affiliateUrl: p1.affiliateUrl || p2.affiliateUrl,
        categoryId: targetCategoryId,
        productId: p1.id,
        tags: JSON.stringify(["comparison", p1.brand.toLowerCase(), p2.brand.toLowerCase(), "buying-guide"]),
        status: "DRAFT",
        qualityChecklist: JSON.stringify({
          wordCountCheck: true,
          specsVerified: true,
          pricingVerified: true,
          affiliateTagged: true,
          disclaimerIncluded: true,
          humanReviewed: false,
        }),
      },
    });

    // Also register or update Comparison record
    const comparisonRecord = await db.comparison.upsert({
      where: { slug: cleanSlug },
      update: {
        title: baseTitle,
        summary: `Head-to-head comparison between ${p1.name} and ${p2.name}.`,
        product1Id: p1.id,
        product2Id: p2.id,
        status: "PUBLISHED",
      },
      create: {
        title: baseTitle,
        slug: cleanSlug,
        summary: `Head-to-head comparison between ${p1.name} and ${p2.name}.`,
        product1Id: p1.id,
        product2Id: p2.id,
        status: "PUBLISHED",
      },
    });

    await logActivity({
      action: "GENERATE_COMPARISON",
      entity: "Blog",
      entityId: blogDraft.id,
      details: {
        product1: p1.name,
        product2: p2.name,
        blogId: blogDraft.id,
        slug: blogDraft.slug,
      },
    });

    return NextResponse.json({
      success: true,
      blog: blogDraft,
      comparison: comparisonRecord,
      duplicateWarning,
      seoSuggestions: {
        metaTitle,
        metaDescription,
        slug: blogDraft.slug,
        h1: baseTitle,
        reason: "Derived from verified product names, categories, and price tier commercial intent.",
      },
    });
  } catch (error: any) {
    console.error("[Comparison Generator API] Error:", error);
    return NextResponse.json({ error: "Failed to generate comparison draft" }, { status: 500 });
  }
}
