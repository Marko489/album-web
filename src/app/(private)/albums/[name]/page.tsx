"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import AlbumGrid from '@/components/AlbumGrid';

const PhotoLookup = dynamic(() => import('@/components/PhotoLookup'), { ssr: false });
const AddPhoto = dynamic(() => import('@/components/AddPhoto'), { ssr: false });

async function getAlbumData() {
  const res = await fetch('/api/albums_page', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch album data');
  return res.json();
}

async function getPhotos(album_id: string) {
  const res = await fetch(`/api/fetch_photos?album_id=${album_id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch photos');
  return res.json();
}

export default function AlbumPageWrapper() {
  // Use a client component wrapper for interactivity
  return <AlbumPageClient />;
}

function AlbumPageClient() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albumName, setAlbumName] = useState('');
  const [albumId, setAlbumId] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [addPhotoOpen, setAddPhotoOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  React.useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { album_id, album_name } = await getAlbumData();
        setAlbumId(album_id);
        setAlbumName(album_name);
        const { photos } = await getPhotos(album_id);
        setPhotos(photos);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const refreshPhotos = async () => {
    if (!albumId) return;
    setLoading(true);
    try {
      const { photos } = await getPhotos(albumId);
      setPhotos(photos);
    } finally {
      setLoading(false);
    }
  };

  // Responsive font and button sizing
  let titleFontSize = '1.5rem';
  let buttonSize = 32;
  let plusFontSize = 18;
  let titleButtonGap = 12;
  let headerMarginTop = 24;
  let headerMarginBottom = 16;
  if (typeof window !== 'undefined') {
    // Cap the effective width at 1200px for scaling
    const effectiveWidth = Math.min(window.innerWidth, 1500);
    let cappedColumns = 2;
    if (effectiveWidth <= 600 && window.innerHeight > window.innerWidth) {
      cappedColumns = 2;
    } else {
      cappedColumns = Math.max(2, Math.ceil(effectiveWidth / 450));
    }
    if (effectiveWidth <= 600 && window.innerHeight > window.innerWidth) {
      titleFontSize = '1.5rem';
      buttonSize = 32;
      plusFontSize = 18;
      titleButtonGap = 10;
      headerMarginTop = 18;
      headerMarginBottom = 10;
    } else {
      // scale up with columns, but smaller than before, and capped
      titleFontSize = `${0.9 + cappedColumns * 0.45}rem`;
      buttonSize = 20 + cappedColumns * 7;
      plusFontSize = Math.round(buttonSize * 0.55);
      titleButtonGap = 6 + cappedColumns * 6;
      headerMarginTop = 16 + cappedColumns * 8;
      headerMarginBottom = 8 + cappedColumns * 6;
    }
  }

  return (
    <main style={{ background: '#181818', minHeight: '100vh', width: '100vw', color: '#f4f4f4', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: `${headerMarginTop}px 0 ${headerMarginBottom}px 0` }}>
        <h1
          style={{
            textAlign: 'center',
            margin: 0,
            fontSize: titleFontSize,
            fontWeight: 800,
            letterSpacing: '-1px',
            lineHeight: 1.1,
            color: '#f4f4f4',
            textShadow: '0 2px 12px rgba(0,0,0,0.32)',
            transition: 'font-size 0.2s',
          }}
        >
          {albumName}
        </h1>
        <button
          className="add-photo-btn"
          aria-label="Add Photo"
          style={{
            width: buttonSize,
            height: buttonSize,
            borderRadius: 12,
            background: '#d7263d',
            color: '#fff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(215,38,61,0.18)',
            marginTop: titleButtonGap,
            marginBottom: 8,
            transition: 'background 0.2s, width 0.2s, height 0.2s',
            padding: 0,
          }}
          onClick={() => setAddPhotoOpen(true)}
        >
          <span style={{ fontSize: plusFontSize, lineHeight: 1, fontWeight: 700, display: 'block', width: '100%', textAlign: 'center' }}>+</span>
        </button>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#f4f4f4' }}>Loading...</div>
      ) : (
        <AlbumGrid photos={photos} onPhotoClick={setSelectedPhoto} />
      )}
      {selectedPhoto && (
        <PhotoLookup
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onPhotoDeleted={refreshPhotos}
        />
      )}
      {addPhotoOpen && (
        <AddPhoto
          album_id={albumId}
          onClose={() => setAddPhotoOpen(false)}
          onPhotoAdded={refreshPhotos}
        />
      )}
    </main>
  );
}
