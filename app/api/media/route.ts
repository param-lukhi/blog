import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const media = await db.media.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(media);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch media assets' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });

      const sanitizeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFilename = `${Date.now()}_${sanitizeName}`;
      const filePath = path.join(uploadsDir, uniqueFilename);

      await writeFile(filePath, buffer);

      const publicUrl = `/uploads/${uniqueFilename}`;
      const newMedia = await db.media.create({
        data: {
          filename: file.name,
          url: publicUrl,
          size: file.size,
          mimeType: file.type || 'image/png',
        },
      });

      return NextResponse.json(newMedia, { status: 201 });
    } else {
      const body = await req.json();
      const { filename, url, size, mimeType } = body;

      if (!filename || !url) {
        return NextResponse.json({ error: 'Filename and URL are required' }, { status: 400 });
      }

      const newMedia = await db.media.create({
        data: {
          filename,
          url,
          size: size || 102400,
          mimeType: mimeType || 'image/webp',
        },
      });

      return NextResponse.json(newMedia, { status: 201 });
    }
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: 'Failed to save media asset' }, { status: 500 });
  }
}
