import { NextResponse, type NextRequest } from 'next/server';
import pool from '../src/lib/db';

export async function middleware(request: NextRequest) {
  // Skip public routes
  if (request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.next();
  }

  // Protect all /albums routes
  if (request.nextUrl.pathname.startsWith('/albums')) {
    const sessionToken = request.cookies.get('session')?.value;
    
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        // Get IP from headers (Vercel, Cloudflare, etc.)
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                 request.headers.get('cf-connecting-ip') || 
                 'unknown';
      // Verify session exists and matches IP
      const { rows } = await pool.query(
        `SELECT album_id FROM sessions 
         WHERE session_token = $1 
         AND ip_address = $2 
         AND expires_at > NOW()`,
        [sessionToken, ip]
      );

      if (!rows.length) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Pass verified album_id to subsequent layers
      const headers = new Headers(request.headers);
      headers.set('x-album-id', rows[0].album_id);
      
      return NextResponse.next({ headers });
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/albums/:path*'],
};