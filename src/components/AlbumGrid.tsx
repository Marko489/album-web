import React from 'react';
import Image from 'next/image';


interface AlbumGridProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
}

const AlbumGrid: React.FC<AlbumGridProps> = ({ photos, onPhotoClick }) => {
  return (
    <div className="masonry-grid">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="masonry-item"
          onClick={() => onPhotoClick?.(photo)}
          style={{ cursor: onPhotoClick ? 'pointer' : 'default' }}
        >
          <Image
            src={photo.blob_url}
            alt={photo.description || 'Album photo'}
            width={400}
            height={300}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '12px',
              marginBottom: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              background: '#f3f3f3',
              objectFit: 'cover',
            }}
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw"
            priority={false}
          />
        </div>
      ))}
      <style jsx>{`
        .masonry-grid {
          column-count: 1;
          column-gap: 16px;
          margin-left: 16px;
          margin-right: 16px;
        }
        @media (min-width: 600px) {
          .masonry-grid {
            column-count: 2;
            margin-left: 32px;
            margin-right: 32px;
          }
        }
        @media (min-width: 900px) {
          .masonry-grid {
            column-count: 3;
          }
        }
        @media (min-width: 1200px) {
          .masonry-grid {
            column-count: 4;
          }
        }
        .masonry-item {
          break-inside: avoid;
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
};

export default AlbumGrid;
