import pool from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

// Then use:
const token = crypto.randomBytes(32).toString('hex');
export async function POST(request: Request) {
  const { name, password, action } = await request.json();

  try {
    if (action === 'login') {
      // Existing album login
      const { rows } = await pool.query(
        `SELECT id, password_hash FROM albums 
         WHERE name = $1`,
        [name]
      );

      if (!rows.length) {
        return NextResponse.json(
          { error: 'Album not found' },
          { status: 404 }
        );
      }

      const isValid = await bcrypt.compare(password, rows[0].password_hash);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        );
      }

      return createSession(rows[0].id, request);

    } else if (action === 'create') {
      // New album creation
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const { rows } = await pool.query(
        `INSERT INTO albums (name, password_hash)
         VALUES ($1, $2)
         RETURNING id`,
        [name, hashedPassword]
      );

      return createSession(rows[0].id, request);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Database operation failed' },
      { status: 500 }
    );
  }
}

async function createSession(albumId: string, request: Request) {
  const token = crypto.randomBytes(32).toString('hex');
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  await pool.query(
    `INSERT INTO sessions 
     (session_token, album_id, ip_address, expires_at)
     VALUES ($1, $2, $3, NOW() + INTERVAL '24 hours')`,
    [token, albumId, ip]
  );

  const response = NextResponse.json(
    { success: true },
    { status: 200 }
  );

  response.cookies.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 86400, // 24 hours
  });

  return response;
}