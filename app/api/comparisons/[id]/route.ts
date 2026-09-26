import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const existing = await db.comparison.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Comparison not found.' }, { status: 404 });
    }

    await db.comparison.delete({ where: { id: params.id } });
    try {
      revalidatePath('/comparisons');
    } catch (_) {}

    return NextResponse.json({ success: true, message: 'Comparison deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete comparison' }, { status: 500 });
  }
}
