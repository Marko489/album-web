import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export default async function PrivateLayout({ children }: { children: ReactNode }) {
  const sessionToken = (await cookies()).get('session')?.value;
  if (!sessionToken) {
    redirect('/login');
  }

  const albumId = (await headers()).get('x-album-id');
  if (!albumId) {
    redirect('/login');
  }

  return <div className="private-layout">{children}</div>;
}