import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const existing = await db.media.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Media asset not found.' }, { status: 404 });
    }

    await db.media.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Media asset deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete media asset' }, { status: 500 });
  }
}
