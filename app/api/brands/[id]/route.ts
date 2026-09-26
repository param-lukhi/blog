import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const existing = await db.brand.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Brand not found.' }, { status: 404 });
    }

    await db.brand.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Brand deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}
