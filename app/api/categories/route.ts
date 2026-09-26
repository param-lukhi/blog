import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rootOnly = searchParams.get('rootOnly') === 'true';

    const where = rootOnly ? { parentId: null } : {};

    const categories = await db.category.findMany({
      where,
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        subcategories: {
          select: { id: true, name: true, slug: true, description: true, icon: true },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: {
            products: true,
            blogs: true,
            subcategories: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, slug, description, icon, image, parentId } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      return NextResponse.json({ error: 'Category slug is required' }, { status: 400 });
    }

    // Verify parentId exists if provided
    let validParentId: string | null = null;
    if (parentId && typeof parentId === 'string' && parentId.trim() !== '') {
      const parentCat = await db.category.findUnique({ where: { id: parentId.trim() } });
      if (!parentCat) {
        return NextResponse.json({ error: 'Selected parent category does not exist' }, { status: 400 });
      }
      validParentId = parentId.trim();
    }

    const category = await db.category.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description ? String(description).trim() : null,
        icon: icon ? String(icon).trim() : null,
        image: image ? String(image).trim() : null,
        parentId: validParentId,
      },
      include: {
        parent: true,
        subcategories: true,
        _count: {
          select: { products: true, blogs: true, subcategories: true },
        },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A category with this name or slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
