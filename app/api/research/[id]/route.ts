import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const isAuth = isAuthorizedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const item = await db.productResearch.findUnique({
      where: { id: params.id },
    });

    if (!item) {
      return NextResponse.json({ error: "Research item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch research item" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const isAuth = isAuthorizedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const existing = await db.productResearch.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Research item not found" }, { status: 404 });
    }

    const updateData: any = {
      name: body.name !== undefined ? body.name.trim() : (body.productName !== undefined ? body.productName.trim() : existing.name),
      brand: body.brand !== undefined ? (body.brand ? body.brand.trim() : null) : existing.brand,
      model: body.model !== undefined ? (body.model ? body.model.trim() : null) : existing.model,
      category: body.category !== undefined ? body.category.trim() : existing.category,
      productUrl: body.productUrl !== undefined ? (body.productUrl ? body.productUrl.trim() : null) : existing.productUrl,
      imageUrl: body.imageUrl !== undefined ? (body.imageUrl ? body.imageUrl.trim() : null) : (body.image !== undefined ? (body.image ? body.image.trim() : null) : existing.imageUrl),
      researchNotes: body.researchNotes !== undefined ? body.researchNotes : existing.researchNotes,
      targetAudience: body.targetAudience !== undefined ? body.targetAudience : existing.targetAudience,
      searchIntent: body.searchIntent !== undefined ? body.searchIntent : existing.searchIntent,
      articleAngle: body.articleAngle !== undefined ? body.articleAngle : (body.suggestedAngle !== undefined ? body.suggestedAngle : existing.articleAngle),
      status: body.status !== undefined ? body.status : existing.status,
      productId: body.productId !== undefined ? body.productId : existing.productId,
      authorId: body.authorId !== undefined ? body.authorId : existing.authorId,
    };

    if (body.specifications !== undefined) {
      updateData.specifications = typeof body.specifications === "string" ? body.specifications : JSON.stringify(body.specifications);
    }
    if (body.keyFeatures !== undefined) {
      updateData.keyFeatures = typeof body.keyFeatures === "string" ? body.keyFeatures : JSON.stringify(body.keyFeatures);
    }
    if (body.pros !== undefined) {
      updateData.pros = typeof body.pros === "string" ? body.pros : JSON.stringify(body.pros);
    }
    if (body.cons !== undefined) {
      updateData.cons = typeof body.cons === "string" ? body.cons : JSON.stringify(body.cons);
    }
    if (body.limitations !== undefined) {
      updateData.limitations = typeof body.limitations === "string" ? body.limitations : JSON.stringify(body.limitations);
    }
    if (body.officialSources !== undefined) {
      updateData.officialSources = typeof body.officialSources === "string" ? body.officialSources : JSON.stringify(body.officialSources);
    }
    if (body.factVerification !== undefined || body.verifiedFacts !== undefined) {
      const facts = body.factVerification !== undefined ? body.factVerification : body.verifiedFacts;
      updateData.factVerification = typeof facts === "string" ? facts : JSON.stringify(facts);
    }

    const updated = await db.productResearch.update({
      where: { id: params.id },
      data: updateData,
    });

    await logActivity({
      action: "PRODUCT_RESEARCH_UPDATED",
      entity: "ProductResearch",
      entityId: updated.id,
      details: { summary: `Updated research for "${updated.name}"`, productName: updated.name, status: updated.status },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("[Research API] Error updating item:", error);
    return NextResponse.json({ error: "Failed to update research item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const isAuth = isAuthorizedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await db.productResearch.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Research item not found" }, { status: 404 });
    }

    await db.productResearch.delete({
      where: { id: params.id },
    });

    await logActivity({
      action: "PRODUCT_RESEARCH_DELETED",
      entity: "ProductResearch",
      entityId: params.id,
      details: { summary: `Deleted research for "${existing.name}"`, productName: existing.name },
    });

    return NextResponse.json({ success: true, message: "Research item deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete research item" }, { status: 500 });
  }
}
