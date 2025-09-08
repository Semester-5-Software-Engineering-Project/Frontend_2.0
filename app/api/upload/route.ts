import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Expect env vars to be configured at build/runtime
const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';
const BUCKET = process.env.AWS_S3_BUCKET as string;

// We only create the client if creds exist to avoid build-time issues
const s3 = new S3Client({
  region: REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  } : undefined,
});

export async function POST(req: NextRequest) {
  if (!BUCKET) {
    return NextResponse.json({ error: 'Missing AWS_S3_BUCKET env variable' }, { status: 500 });
  }

  try {
    const { fileName, fileType } = await req.json();
    if (!fileName || !fileType) {
      return NextResponse.json({ error: 'fileName and fileType are required' }, { status: 400 });
    }

    // Basic content-type allow list (images only)
    if (!/^image\//.test(fileType)) {
      return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400 });
    }

    // Use a timestamp prefix to reduce collision risk
    const objectKey = `profile-images/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: objectKey,
      ContentType: fileType,
      ACL: 'public-read',
    } as any); // ACL for public URL access (ensure bucket policy permits this)

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 }); // 1 minute

    const publicUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${objectKey}`;

    return NextResponse.json({ uploadUrl: signedUrl, publicUrl, key: objectKey });
  } catch (e: any) {
    console.error('Upload route error', e);
    return NextResponse.json({ error: e.message || 'Failed to create upload URL' }, { status: 500 });
  }
}
