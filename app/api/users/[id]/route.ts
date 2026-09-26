import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthorizedAdmin, getAdminSession } from '@/lib/auth';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const session = getAdminSession();
    if (session && session.sub === params.id) {
      return NextResponse.json({ error: 'Cannot delete your own active administrator account.' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { id: params.id } });
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    await db.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
