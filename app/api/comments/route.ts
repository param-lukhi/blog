import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

function sanitizeText(str: string): string {
  return str
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('blogId');
    const status = searchParams.get('status');

    const isAdmin = isAuthorizedAdmin();

    const where: any = {};
    if (blogId) where.blogId = blogId;

    if (isAdmin) {
      if (status) where.status = status;
      const comments = await db.comment.findMany({
        where,
        include: {
          blog: {
            select: { id: true, title: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(comments);
    } else {
      // Public visitors can ONLY view APPROVED comments
      where.status = 'APPROVED';
      const comments = await db.comment.findMany({
        where,
        select: {
          id: true,
          author: true,
          content: true,
          createdAt: true,
          blogId: true,
          status: true,
          // Intentionally omitting 'email' to prevent public scraping / PII leak
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(comments);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);

    // Rate limit: 5 comments per 5 minutes per IP
    const rateLimit = checkRateLimit(`comments:${clientIp}`, {
      windowMs: 5 * 60 * 1000,
      max: 5,
    });

    if (!rateLimit.success) {
      const waitSeconds = Math.ceil((rateLimit.reset - Date.now()) / 1000);
      return NextResponse.json(
        { error: `Too many comments submitted. Please wait ${waitSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { author, email, content, blogId } = body;

    const rawAuthor = typeof author === 'string' ? author.trim() : '';
    const rawContent = typeof content === 'string' ? content.trim() : '';
    const rawEmail = typeof email === 'string' ? email.trim() : '';

    if (!rawAuthor || rawAuthor.length < 2 || rawAuthor.length > 60) {
      return NextResponse.json({ error: 'Author name must be between 2 and 60 characters.' }, { status: 400 });
    }

    if (!rawContent || rawContent.length < 3 || rawContent.length > 2000) {
      return NextResponse.json({ error: 'Comment must be between 3 and 2000 characters.' }, { status: 400 });
    }

    const cleanAuthor = sanitizeText(rawAuthor);
    const cleanContent = sanitizeText(rawContent);
    const cleanEmail = rawEmail && rawEmail.includes('@') && rawEmail.length <= 120
      ? rawEmail.toLowerCase()
      : `${cleanAuthor.toLowerCase().replace(/[^a-z0-9]/g, '') || 'guest'}@community.user`;

    // Verify blog exists if blogId is provided
    if (blogId) {
      const targetBlog = await db.blog.findUnique({
        where: { id: blogId },
        select: { id: true, status: true },
      });
      if (!targetBlog || targetBlog.status !== 'PUBLISHED') {
        return NextResponse.json({ error: 'Target article not found' }, { status: 404 });
      }
    }

    // Check if comment contains external links/spam triggers
    const hasExternalLink = /https?:\/\/|www\./i.test(rawContent);
    const initialStatus = hasExternalLink ? 'PENDING' : 'APPROVED';

    // Prevent duplicate comment submission
    const existing = await db.comment.findFirst({
      where: {
        blogId: blogId || null,
        author: cleanAuthor,
        content: cleanContent,
      },
    });

    if (existing) {
      return NextResponse.json({
        id: existing.id,
        author: existing.author,
        content: existing.content,
        createdAt: existing.createdAt,
        status: existing.status,
      }, { status: 200 });
    }

    const comment = await db.comment.create({
      data: {
        author: cleanAuthor,
        email: cleanEmail,
        content: cleanContent,
        blogId: blogId || null,
        status: initialStatus,
      },
      select: {
        id: true,
        author: true,
        content: true,
        createdAt: true,
        blogId: true,
        status: true,
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 });
  }
}
