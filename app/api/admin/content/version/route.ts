import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/adminAuth';
import prisma from '@/lib/prisma';
import { logActivity } from '@/lib/activity';

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const blogId = searchParams.get('blogId');

  if (!blogId) {
    return NextResponse.json({ error: 'blogId is required' }, { status: 400 });
  }

  const versions = await prisma.contentVersion.findMany({
    where: { blogId },
    orderBy: { versionNumber: 'desc' },
  });

  return NextResponse.json({ versions });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminAuth(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const body = await req.json();
  const { action, versionId, blogId } = body;

  if (action === 'ROLLBACK') {
    if (!versionId || !blogId) {
      return NextResponse.json({ error: 'versionId and blogId are required for rollback' }, { status: 400 });
    }

    const targetVersion = await prisma.contentVersion.findUnique({
      where: { id: versionId },
    });

    if (!targetVersion) {
      return NextResponse.json({ error: 'Target version not found' }, { status: 404 });
    }

    const currentBlog = await prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!currentBlog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // 1. Snapshot current version before rollback
    const count = await prisma.contentVersion.count({ where: { blogId } });
    await prisma.contentVersion.create({
      data: {
        blogId,
        versionNumber: count + 1,
        title: currentBlog.title,
        content: currentBlog.content,
        metaTitle: currentBlog.metaTitle,
        metaDescription: currentBlog.metaDescription,
        changeSummary: `Automatic snapshot prior to rolling back to version ${targetVersion.versionNumber}`,
        changedBy: auth.username,
      },
    });

    // 2. Perform rollback
    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        title: targetVersion.title,
        content: targetVersion.content,
        metaTitle: targetVersion.metaTitle,
        metaDescription: targetVersion.metaDescription,
      },
    });

    await logActivity({
      action: 'UPDATE',
      entity: 'BLOG',
      entityId: blogId,
      details: {
        summary: `Admin rolled back blog "${currentBlog.title}" to version ${targetVersion.versionNumber}`,
        version: targetVersion.versionNumber,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully rolled back to version ${targetVersion.versionNumber}.`,
      blog: updatedBlog,
    });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
