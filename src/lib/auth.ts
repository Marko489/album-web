// lib/auth.ts — call this at the top of every API route
import pool from './db';

export async function verifySession(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const sessionToken = cookie.match(/session=([^;]+)/)?.[1];
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  if (!sessionToken) throw new Error('No session');

  const { rows } = await pool.query(
    `SELECT album_id FROM sessions 
     WHERE session_token = $1 
     AND ip_address = $2 
     AND expires_at > NOW()`,
    [sessionToken, ip]
  );

  if (!rows.length) throw new Error('Invalid session');
  return rows[0].album_id as string;
}