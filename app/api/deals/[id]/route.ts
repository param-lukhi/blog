import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const existing = await db.deal.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Deal not found.' }, { status: 404 });
    }

    await db.deal.delete({ where: { id: params.id } });

    try {
      revalidatePath('/deals');
      revalidatePath('/');
    } catch (_) {}

    return NextResponse.json({ success: true, message: 'Deal deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 });
  }
}
