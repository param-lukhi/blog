import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';
import { validateMediaFile, processMediaUpload } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const media = await db.media.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json(media);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch media assets' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isAuthorizedAdmin()) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 401 });
  }

  try {
    const contentType = req.headers.get('content-type') || '';

    // 1. Multipart Form Data (File Upload)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
      }

      // Validate file type & size
      const validation = validateMediaFile({
        size: file.size,
        type: file.type || 'image/png',
        name: file.name || 'image.png',
      });

      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const mimeType = file.type || 'image/png';

      // Process upload via cloud storage or secure local write (never raw Base64 in database)
      const uploadResult = await processMediaUpload(buffer, file.name, mimeType, file.size);

      const newMedia = await db.media.create({
        data: {
          filename: uploadResult.filename,
          url: uploadResult.url,
          size: uploadResult.size,
          mimeType: uploadResult.mimeType,
        },
      });

      return NextResponse.json(newMedia, { status: 201 });
    }

    // 2. JSON Payload (External Image URL Reference)
    const body = await req.json();
    const { filename, url, size, mimeType } = body;

    if (!filename || !url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Filename and valid URL are required' }, { status: 400 });
    }

    if (!url.startsWith('https://') && !url.startsWith('/uploads/')) {
      return NextResponse.json({ error: 'Image URL must be a valid https link or internal upload' }, { status: 400 });
    }

    const newMedia = await db.media.create({
      data: {
        filename: String(filename).trim(),
        url: String(url).trim(),
        size: size ? Number(size) : 102400,
        mimeType: mimeType ? String(mimeType).trim() : 'image/webp',
      },
    });

    return NextResponse.json(newMedia, { status: 201 });
  } catch (error: any) {
    console.error('Media upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process media asset' },
      { status: 500 }
    );
  }
}
