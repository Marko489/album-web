import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';

export default async function PrivateLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { name?: string };
}) {
  const sessionToken =(await cookies()).get('session')?.value;
  
  if (!sessionToken) {
    redirect('/login');
  }

  // Get album_id from middleware
  const albumId = (await headers()).get('x-album-id');

  if (!albumId) {
    redirect('/login');
  }

  // For album pages, verify name matches session's album_id
  if (params?.name) {
    const { rows } = await pool.query(
      `SELECT id FROM albums 
       WHERE id = $1 AND name = $2`,
      [albumId, params.name]
    );

    if (!rows.length) {
      redirect('/login');
    }
  }

  return <div className="private-layout">{children}</div>;
}