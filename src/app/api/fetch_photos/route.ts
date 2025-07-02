import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const album_id = searchParams.get('album_id');

  if (!album_id) {
    return NextResponse.json({ error: 'Missing album_id' }, { status: 400 });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, blob_url, description, uploader_name, uploaded_at, view_count, display_order, mime_type
       FROM photos
       WHERE album_id = $1
       ORDER BY display_order, uploaded_at`,
      [album_id]
    );
    return NextResponse.json({ photos: rows }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
