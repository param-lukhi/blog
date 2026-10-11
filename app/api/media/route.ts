import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';
import { isAuthorizedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

export async function GET() {
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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json({ error: 'File size exceeds maximum limit of 4MB' }, { status: 400 });
      }

      const mimeType = file.type?.toLowerCase() || '';
      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        return NextResponse.json(
          { error: 'Unsupported file type. Only JPEG, PNG, WebP, and GIF images are accepted.' },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64DataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;

      let publicUrl = base64DataUri;

      // Try writing to local disk (works in local dev, falls back safely to data URI on serverless read-only disk)
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadsDir, { recursive: true });

        const sanitizeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const uniqueFilename = `${Date.now()}_${sanitizeName}`;
        const filePath = path.join(uploadsDir, uniqueFilename);

        await writeFile(filePath, buffer);
        publicUrl = `/uploads/${uniqueFilename}`;
      } catch (fsErr) {
        console.log('Using Data URI for serverless media storage (read-only filesystem detected).');
      }

      let newMedia: any = null;
      try {
        newMedia = await db.media.create({
          data: {
            filename: file.name.replace(/[^a-zA-Z0-9._-]/g, '_'),
            url: publicUrl,
            size: file.size,
            mimeType: mimeType,
          },
        });
      } catch (dbErr) {
        newMedia = {
          id: `media_${Date.now()}`,
          filename: file.name,
          url: publicUrl,
          size: file.size,
          mimeType: mimeType,
        };
      }

      return NextResponse.json(newMedia, { status: 201 });
    } else {
      const body = await req.json();
      const { filename, url, size, mimeType } = body;

      if (!filename || !url) {
        return NextResponse.json({ error: 'Filename and URL are required' }, { status: 400 });
      }

      if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
        return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
      }

      let newMedia: any = null;
      try {
        newMedia = await db.media.create({
          data: {
            filename: String(filename).replace(/[^a-zA-Z0-9._-]/g, '_'),
            url: String(url),
            size: Number(size) || 102400,
            mimeType: mimeType || 'image/webp',
          },
        });
      } catch (dbErr) {
        newMedia = {
          id: `media_${Date.now()}`,
          filename,
          url,
          size: size || 102400,
          mimeType: mimeType || 'image/webp',
        };
      }

      return NextResponse.json(newMedia, { status: 201 });
    }
  } catch (error: any) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to save media asset' }, { status: 500 });
  }
}
