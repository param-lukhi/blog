import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, slug, domain, logo, affiliateTag, isActive } = body;

    const existing = await db.store.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const updated = await db.store.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? String(name).trim() : existing.name,
        slug: slug !== undefined ? String(slug).trim().toLowerCase() : existing.slug,
        domain: domain !== undefined ? (domain ? String(domain).trim() : null) : existing.domain,
        logo: logo !== undefined ? (logo ? String(logo).trim() : null) : existing.logo,
        affiliateTag: affiliateTag !== undefined ? (affiliateTag ? String(affiliateTag).trim() : null) : existing.affiliateTag,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
    });

    await logActivity({
      action: 'STORE_UPDATED',
      entity: 'Store',
      entityId: updated.id,
      details: { storeName: updated.name, slug: updated.slug, isActive: updated.isActive },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update store' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const existing = await db.store.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    await db.store.delete({ where: { id: params.id } });

    await logActivity({
      action: 'STORE_DELETED',
      entity: 'Store',
      entityId: params.id,
      details: { storeName: existing.name },
    });

    return NextResponse.json({ success: true, message: 'Store deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete store' }, { status: 500 });
  }
}
