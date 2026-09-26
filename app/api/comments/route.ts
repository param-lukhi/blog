import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const blogId = searchParams.get('blogId');

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (blogId) {
      where.blogId = blogId;
    }

    const comments = await db.comment.findMany({
      where,
      include: { blog: { select: { id: true, title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Rate limit: 5 comments per 10 minutes per IP
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(`comment_${clientIp}`, 5, 10 * 60);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many comments submitted. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { author, email, content, blogId } = body;

    if (!author || typeof author !== 'string' || author.trim().length === 0) {
      return NextResponse.json({ error: 'Author name is required' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }

    if (content.trim().length > 2000) {
      return NextResponse.json({ error: 'Comment cannot exceed 2000 characters' }, { status: 400 });
    }

    // Verify blogId if provided
    let verifiedBlogId: string | null = null;
    if (blogId && typeof blogId === 'string' && blogId.trim() !== '') {
      const blog = await db.blog.findUnique({ where: { id: blogId.trim() } });
      if (blog) {
        verifiedBlogId = blog.id;
      }
    }

    const comment = await db.comment.create({
      data: {
        author: author.trim().slice(0, 100),
        email: email.trim().toLowerCase().slice(0, 150),
        content: content.trim(),
        blogId: verifiedBlogId,
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Comment submitted successfully and is awaiting moderation.',
        comment,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 });
  }
}
