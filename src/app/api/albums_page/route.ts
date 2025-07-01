import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Get session token from cookies
  const cookieHeader = request.headers.get('cookie') || '';
  const sessionMatch = cookieHeader.match(/session=([^;]+)/);
  const sessionToken = sessionMatch ? sessionMatch[1] : null;

  if (!sessionToken) {
    return NextResponse.json({ error: 'No session token found' }, { status: 401 });
  }

  try {
    // Get IP from headers (Vercel, Cloudflare, etc.)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('cf-connecting-ip') || 
               'unknown';

    // Validate session and get album_id from DB
    const { rows } = await pool.query(
      `SELECT album_id FROM sessions WHERE session_token = $1 AND ip_address = $2 AND expires_at > NOW()`,
      [sessionToken, ip]
    );

    if (!rows.length) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const album_id = rows[0].album_id;

    // Fetch album name from albums table
    const albumRows = await pool.query(
      `SELECT name FROM albums WHERE id = $1`,
      [album_id]
    );

    if (!albumRows.rows.length) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }

    return NextResponse.json({ album_id, album_name: albumRows.rows[0].name }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
