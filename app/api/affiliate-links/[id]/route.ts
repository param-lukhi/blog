import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const existing = await db.affiliateLink.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Affiliate link not found.' }, { status: 404 });
    }

    await db.affiliateLink.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Affiliate link deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete affiliate link' }, { status: 500 });
  }
}
