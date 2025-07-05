import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { put } from '@vercel/blob';

// ✅ Remove Edge runtime – switch to Node.js for larger uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const album_id = formData.get('album_id');
    const description = formData.get('description') || '';
    const file = formData.get('photo');

    if (!album_id || typeof album_id !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid album_id' }, { status: 400 });
    }
    if (!file || typeof file !== 'object' || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'Missing or invalid photo file' }, { status: 400 });
    }

    const filename = `${Date.now()}-${(file as File).name || 'photo'}`;
    const { url: blob_url } = await put(filename, file, { access: 'public' });

    const insertRes = await pool.query(
      `INSERT INTO photos (album_id, blob_url, description, mime_type)
       VALUES ($1, $2, $3, $4)
       RETURNING id, album_id, blob_url, description, mime_type, uploaded_at, display_order, uploader_name, view_count`,
      [album_id, blob_url, description, (file as File).type || 'image/jpeg']
    );

    return NextResponse.json({ photo: insertRes.rows[0] }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || 'Failed to add photo' }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Failed to add photo' }, { status: 500 });
    }
  }
}
