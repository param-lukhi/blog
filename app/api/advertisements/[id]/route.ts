import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const existing = await db.advertisement.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Advertisement not found.' }, { status: 404 });
    }

    const updated = await db.advertisement.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update advertisement' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const existing = await db.advertisement.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Advertisement not found.' }, { status: 404 });
    }

    await db.advertisement.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Advertisement deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete advertisement' }, { status: 500 });
  }
}
