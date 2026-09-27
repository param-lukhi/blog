import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import { generateArticleFromResearch, validateResearchForArticleGeneration } from '@/lib/researchWorkflow';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Research ID is required.' }, { status: 400 });
  }

  try {
    const research = await db.productResearch.findUnique({
      where: { id },
    });

    if (!research) {
      return NextResponse.json({ error: 'Research item not found.' }, { status: 404 });
    }

    let linkedBlog = null;
    if (research.blogId) {
      linkedBlog = await db.blog.findUnique({
        where: { id: research.blogId },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          views: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    return NextResponse.json({
      researchId: research.id,
      name: research.name,
      status: research.status,
      blogId: research.blogId,
      canGenerateDraft: research.status === 'RESEARCHED',
      linkedBlog,
    });
  } catch (error: any) {
    console.error('[API research/draft GET Error]:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve research draft status.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Research ID is required.' }, { status: 400 });
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const force = Boolean(body?.force);

    // Validate research lifecycle before proceeding
    const validation = await validateResearchForArticleGeneration(id);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: validation.error,
          currentStatus: validation.research?.status,
        },
        { status: 400 }
      );
    }

    // Execute article generation workflow
    const result = await generateArticleFromResearch(id, {
      force,
      adminEmail: auth.username,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'Article generation failed.',
          steps: result.steps,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(result, { status: result.alreadyExists ? 200 : 201 });
  } catch (error: any) {
    console.error('[API research/draft POST Error]:', error);
    return NextResponse.json(
      {
        error: `Article generation failed. Research data was preserved. Please retry. (${error?.message || 'Internal Server Error'})`,
      },
      { status: 500 }
    );
  }
}
