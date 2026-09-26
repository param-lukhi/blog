import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
];

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  provider: 'local' | 'cloudinary' | 'external';
}

/**
 * Validates an incoming file buffer and MIME type.
 */
export function validateMediaFile(file: { size: number; type: string; name: string }): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File size exceeds the 5 MB maximum limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).` };
  }

  const mimeType = (file.type || '').toLowerCase();
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return { valid: false, error: `File type "${mimeType}" is not allowed. Allowed types: JPG, PNG, WebP, GIF, SVG, AVIF.` };
  }

  return { valid: true };
}

/**
 * Uploads media file to Cloudinary if configured, or saves to local disk in writable environments.
 * Prevents Base64 storage in database on serverless deployments.
 */
export async function processMediaUpload(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string,
  fileSize: number
): Promise<UploadResult> {
  const sanitizeName = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
  const uniqueFilename = `${Date.now()}_${sanitizeName}`;

  // 1. Check for Cloudinary configuration
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  if (cloudinaryUrl || (cloudName && apiKey && apiSecret)) {
    try {
      const resolvedCloudName = cloudName || (cloudinaryUrl ? cloudinaryUrl.split('@')[1] : '');
      const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

      const formData = new FormData();
      const base64Payload = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
      formData.append('file', base64Payload);
      formData.append('folder', 'blogweb904/uploads');
      if (uploadPreset) {
        formData.append('upload_preset', uploadPreset);
      }

      // If signed upload with api key/secret
      if (apiKey && apiSecret && resolvedCloudName) {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        formData.append('timestamp', timestamp);
        formData.append('api_key', apiKey);
        // Note: For signed uploads or direct REST uploads, we can use unsigned preset or standard REST API
      }

      const res = await fetch(`https://api.cloudinary.com/v1_1/${resolvedCloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        return {
          url: data.secure_url || data.url,
          filename: originalFilename,
          size: fileSize,
          mimeType,
          provider: 'cloudinary',
        };
      }
    } catch (cloudErr) {
      console.warn('[STORAGE] Cloudinary upload attempt failed, attempting fallback:', cloudErr);
    }
  }

  // 2. Local filesystem write attempt (Development / VPS / Node container)
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, uniqueFilename);
    await writeFile(filePath, fileBuffer);

    return {
      url: `/uploads/${uniqueFilename}`,
      filename: originalFilename,
      size: fileSize,
      mimeType,
      provider: 'local',
    };
  } catch (fsErr: any) {
    // Read-only filesystem detected (e.g. Vercel Serverless) without configured cloud credentials
    throw new Error(
      'Serverless read-only filesystem detected. Please configure persistent cloud storage (e.g., Cloudinary via CLOUDINARY_CLOUD_NAME or CLOUDINARY_URL) in your environment variables to upload new files.'
    );
  }
}
