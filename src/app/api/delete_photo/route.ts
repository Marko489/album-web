import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { del } from '@vercel/blob';

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid photo id' }, { status: 400 });
    }

    // Get blob_url from DB
    const { rows } = await pool.query(
      'SELECT blob_url FROM photos WHERE id = $1',
      [id]
    );
    if (!rows.length) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }
    const blob_url = rows[0].blob_url;

    // Delete from DB
    await pool.query('DELETE FROM photos WHERE id = $1', [id]);

    // Delete from Vercel Blob
    await del(blob_url);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
    }
  }
}
