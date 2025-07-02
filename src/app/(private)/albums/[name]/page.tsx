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

  return (
    <main>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '2.5rem 0 2rem 0' }}>
        <h1
          style={{
            textAlign: 'center',
            margin: 0,
            fontSize: '2.8rem',
            fontWeight: 800,
            letterSpacing: '-1px',
            lineHeight: 1.1,
            color: '#181818',
            textShadow: '0 2px 12px rgba(0,0,0,0.07)',
          }}
        >
          {albumName}
        </h1>
        <button
          className="add-photo-btn"
          aria-label="Add Photo"
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: '#222',
            color: '#fff',
            fontSize: 32,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            marginTop: 24,
            marginBottom: 8,
            transition: 'background 0.2s',
          }}
          onClick={() => setAddPhotoOpen(true)}
        >
          +
        </button>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>
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
