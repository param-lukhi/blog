import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status } = body;

    const allowedStatuses = ['PENDING', 'APPROVED', 'SPAM'];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be PENDING, APPROVED, or SPAM.' }, { status: 400 });
    }

    const existing = await db.comment.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Comment not found.' }, { status: 404 });
    }

    const updated = await db.comment.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const existing = await db.comment.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Comment not found.' }, { status: 404 });
    }

    await db.comment.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Comment deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
