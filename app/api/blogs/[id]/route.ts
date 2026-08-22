import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { safeJsonParse } from '@/lib/utils';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const blog = await db.blog.findUnique({
      where: { id: params.id },
      include: { category: true, product: true },
    });

    if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
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
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const updateData: any = { ...body };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.category;
    delete updateData.product;
    delete updateData.comments;

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
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to patch blog' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const blog = await db.blog.findUnique({ where: { id: params.id } });
    await db.blog.delete({ where: { id: params.id } });

    revalidatePath('/');
    revalidatePath('/blog');
    if (blog) revalidatePath(`/blog/${blog.slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}
