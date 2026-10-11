import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const isAdmin = isAuthorizedAdmin();
    const product = await db.product.findUnique({
      where: { id: params.id },
      include: { category: true },
    });

    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    if (!isAdmin && product.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    if (updateData.slug) {
      updateData.slug = slugify(updateData.slug);
      const existing = await db.product.findUnique({ where: { slug: updateData.slug } });
      if (existing && existing.id !== params.id) {
        return NextResponse.json({ error: 'Another product is already using this slug' }, { status: 409 });
      }
    }

    if (typeof updateData.images === 'object') updateData.images = JSON.stringify(updateData.images);
    if (typeof updateData.specifications === 'object') updateData.specifications = JSON.stringify(updateData.specifications);
    if (typeof updateData.features === 'object') updateData.features = JSON.stringify(updateData.features);
    if (typeof updateData.pros === 'object') updateData.pros = JSON.stringify(updateData.pros);
    if (typeof updateData.cons === 'object') updateData.cons = JSON.stringify(updateData.cons);
    if (typeof updateData.marketplaces === 'object') updateData.marketplaces = JSON.stringify(updateData.marketplaces);

    const updatedProduct = await db.product.update({
      where: { id: params.id },
      data: updateData,
    });

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath(`/product/${updatedProduct.slug}`);
    revalidatePath('/deals');

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message || 'Failed to update product' }, { status: 500 });
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

    if (updateData.slug) {
      updateData.slug = slugify(updateData.slug);
      const existing = await db.product.findUnique({ where: { slug: updateData.slug } });
      if (existing && existing.id !== params.id) {
        return NextResponse.json({ error: 'Another product is already using this slug' }, { status: 409 });
      }
    }

    if (typeof updateData.images === 'object') updateData.images = JSON.stringify(updateData.images);
    if (typeof updateData.specifications === 'object') updateData.specifications = JSON.stringify(updateData.specifications);
    if (typeof updateData.features === 'object') updateData.features = JSON.stringify(updateData.features);
    if (typeof updateData.pros === 'object') updateData.pros = JSON.stringify(updateData.pros);
    if (typeof updateData.cons === 'object') updateData.cons = JSON.stringify(updateData.cons);
    if (typeof updateData.marketplaces === 'object') updateData.marketplaces = JSON.stringify(updateData.marketplaces);

    const updatedProduct = await db.product.update({
      where: { id: params.id },
      data: updateData,
    });

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath(`/product/${updatedProduct.slug}`);
    revalidatePath('/deals');

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message || 'Failed to patch product' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const product = await db.product.findUnique({ where: { id: params.id } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await db.product.delete({ where: { id: params.id } });

    revalidatePath('/');
    revalidatePath('/products');
    revalidatePath(`/product/${product.slug}`);
    revalidatePath('/deals');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
