import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { safeJsonParse, slugify } from '@/lib/utils';
import { isAuthorizedAdmin } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const isAdmin = isAuthorizedAdmin();
    const blog = await db.blog.findUnique({
      where: { id: params.id },
      include: { category: true, product: true },
    });

    if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });

    // Non-admins cannot inspect draft or unpublished articles via direct ID API
    if (!isAdmin && blog.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
  }
}

function sanitizeJson(val: any) {
  if (val === undefined) return undefined;
  if (val === null) return null;
  if (typeof val === 'string') {
    const parsed = safeJsonParse(val, null);
    if (parsed !== null && typeof parsed === 'object') {
      return JSON.stringify(parsed);
    }
    return val;
  }
  return JSON.stringify(val);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Clean fields that should not be in update object
    const updateData: any = { ...body };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.category;
    delete updateData.product;
    delete updateData.comments;

    // Check slug uniqueness if slug is being modified
    if (updateData.slug) {
      updateData.slug = slugify(updateData.slug);
      const existing = await db.blog.findUnique({ where: { slug: updateData.slug } });
      if (existing && existing.id !== params.id) {
        return NextResponse.json({ error: 'Another article is already using this slug' }, { status: 409 });
      }
    }

    if (updateData.specifications !== undefined) updateData.specifications = sanitizeJson(updateData.specifications);
    if (updateData.features !== undefined) updateData.features = sanitizeJson(updateData.features);
    if (updateData.pros !== undefined) updateData.pros = sanitizeJson(updateData.pros);
    if (updateData.cons !== undefined) updateData.cons = sanitizeJson(updateData.cons);
    if (updateData.faqs !== undefined) updateData.faqs = sanitizeJson(updateData.faqs);
    if (updateData.tags !== undefined) updateData.tags = sanitizeJson(updateData.tags);
    if (updateData.marketplaces !== undefined) updateData.marketplaces = sanitizeJson(updateData.marketplaces);

    const updatedBlog = await db.blog.update({
      where: { id: params.id },
      data: updateData,
    });

    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath(`/blog/${updatedBlog.slug}`);

    return NextResponse.json(updatedBlog);
  } catch (error: any) {
    console.error('Update blog error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update blog' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updateData: any = { ...body };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.category;
    delete updateData.product;
    delete updateData.comments;

    if (updateData.slug) {
      updateData.slug = slugify(updateData.slug);
      const existing = await db.blog.findUnique({ where: { slug: updateData.slug } });
      if (existing && existing.id !== params.id) {
        return NextResponse.json({ error: 'Another article is already using this slug' }, { status: 409 });
      }
    }

    if (updateData.specifications !== undefined) updateData.specifications = sanitizeJson(updateData.specifications);
    if (updateData.features !== undefined) updateData.features = sanitizeJson(updateData.features);
    if (updateData.pros !== undefined) updateData.pros = sanitizeJson(updateData.pros);
    if (updateData.cons !== undefined) updateData.cons = sanitizeJson(updateData.cons);
    if (updateData.faqs !== undefined) updateData.faqs = sanitizeJson(updateData.faqs);
    if (updateData.tags !== undefined) updateData.tags = sanitizeJson(updateData.tags);
    if (updateData.marketplaces !== undefined) updateData.marketplaces = sanitizeJson(updateData.marketplaces);

    const updatedBlog = await db.blog.update({
      where: { id: params.id },
      data: updateData,
    });

    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath(`/blog/${updatedBlog.slug}`);

    return NextResponse.json(updatedBlog);
  } catch (error: any) {
    console.error('Patch blog error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to patch blog' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const blog = await db.blog.findUnique({ where: { id: params.id } });
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    await db.blog.delete({ where: { id: params.id } });

    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath(`/blog/${blog.slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}
