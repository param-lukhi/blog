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
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (category && category !== "ALL") {
      where.category = { contains: category, mode: "insensitive" };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { searchIntent: { contains: search, mode: "insensitive" } },
      ];
    }

    const researchItems = await db.productResearch.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(researchItems);
  } catch (error: any) {
    console.error("[Research API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch research items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAuth = isAuthorizedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      productName,
      name,
      brand,
      model,
      category,
      productUrl,
      imageUrl,
      image,
      researchNotes,
      targetAudience,
      searchIntent,
      suggestedAngle,
      articleAngle,
      status = "IDEA",
      specifications,
      keyFeatures,
      pros,
      cons,
      alternatives,
      limitations,
      officialSources,
      verifiedFacts,
      factVerification,
      authorId,
    } = body;

    const actualName = (name || productName || "").trim();
    if (!actualName) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    const newItem = await db.productResearch.create({
      data: {
        name: actualName,
        brand: brand ? brand.trim() : null,
        model: model ? model.trim() : null,
        category: category ? category.trim() : "General",
        productUrl: productUrl ? productUrl.trim() : null,
        imageUrl: (imageUrl || image) ? (imageUrl || image).trim() : null,
        researchNotes: researchNotes || null,
        targetAudience: targetAudience || null,
        searchIntent: searchIntent || null,
        articleAngle: (articleAngle || suggestedAngle) || null,
        status: status || "IDEA",
        specifications: specifications ? (typeof specifications === "string" ? specifications : JSON.stringify(specifications)) : null,
        keyFeatures: keyFeatures ? (typeof keyFeatures === "string" ? keyFeatures : JSON.stringify(keyFeatures)) : null,
        pros: pros ? (typeof pros === "string" ? pros : JSON.stringify(pros)) : null,
        cons: cons ? (typeof cons === "string" ? cons : JSON.stringify(cons)) : null,
        limitations: limitations ? (typeof limitations === "string" ? limitations : JSON.stringify(limitations)) : null,
        officialSources: officialSources ? (typeof officialSources === "string" ? officialSources : JSON.stringify(officialSources)) : null,
        factVerification: (factVerification || verifiedFacts) ? (typeof (factVerification || verifiedFacts) === "string" ? (factVerification || verifiedFacts) : JSON.stringify(factVerification || verifiedFacts)) : null,
        authorId: authorId || null,
      },
    });

    await logActivity({
      action: "PRODUCT_RESEARCH_CREATED",
      entity: "ProductResearch",
      entityId: newItem.id,
      details: { summary: `Created product research for "${newItem.name}"`, productName: newItem.name, status: newItem.status },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    console.error("[Research API] Error creating item:", error);
    return NextResponse.json({ error: "Failed to create research item" }, { status: 500 });
  }
}
