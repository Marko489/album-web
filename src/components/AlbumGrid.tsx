import React from 'react';

interface Photo {
  id: string;
  blob_url: string;
  description?: string;
  uploader_name?: string;
  uploaded_at?: string;
  view_count?: number;
  display_order?: number;
  mime_type?: string;
}

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
          <img
            src={photo.blob_url}
            alt={photo.description || 'Album photo'}
            style={{
              width: '100%',
              display: 'block',
              borderRadius: '12px',
              marginBottom: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              background: '#f3f3f3',
            }}
          />
        </div>
      ))}
      <style jsx>{`
        .masonry-grid {
          column-count: 1;
          column-gap: 16px;
        }
        @media (min-width: 600px) {
          .masonry-grid {
            column-count: 2;
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
