import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // just JSON metadata, no image file
    },
  },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { album_id, description, blob_url, mime_type } = body;

    if (!album_id || typeof album_id !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid album_id' }, { status: 400 });
    }

    if (!blob_url || typeof blob_url !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid blob_url' }, { status: 400 });
    }

    const insertRes = await pool.query(
      `INSERT INTO photos (album_id, blob_url, description, mime_type)
       VALUES ($1, $2, $3, $4)
       RETURNING id, album_id, blob_url, description, mime_type, uploaded_at, display_order, uploader_name, view_count`,
      [album_id, blob_url, description || '', mime_type || 'image/jpeg']
    );

    return NextResponse.json({ photo: insertRes.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to add photo' }, { status: 500 });
  }
}
