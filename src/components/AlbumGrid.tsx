import React, { useEffect, useState } from 'react';
import Image from 'next/image';


interface AlbumGridProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
}

const AlbumGrid: React.FC<AlbumGridProps> = ({ photos, onPhotoClick }) => {
  // Responsive: 2 columns for mobile portrait, dynamic columns for others
  const [columns, setColumns] = useState(2);

  useEffect(() => {
    function updateColumns() {
      if (window.innerWidth <= 600 && window.innerHeight > window.innerWidth) {
        setColumns(2);
      } else {
        const cols = Math.max(2, Math.ceil(window.innerWidth / 450));
        setColumns(cols);
      }
    }
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  return (
    <div
      className="masonry-grid"
      style={{
        columnCount: columns,
        columnGap: '10px',
        marginLeft: '2vw',
        marginRight: '2vw',
      }}
    >
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="masonry-item"
          onClick={() => onPhotoClick?.(photo)}
          style={{ cursor: onPhotoClick ? 'pointer' : 'default', position: 'relative', borderRadius: '12px', overflow: 'hidden' }}
        >
          <Image
            src={photo.blob_url}
            alt={photo.description || 'Album photo'}
            width={300}
            height={225}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '12px',
              marginBottom: '0px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              background: '#f3f3f3',
              objectFit: 'cover',
              display: 'block',
            }}
            sizes="(max-width: 600px) 48vw, 300px"
            priority={false}
          />
          <div className="masonry-overlay" />
        </div>
      ))}
      <style jsx>{`
        .masonry-grid {
          /* column-count and gap set inline for dynamic columns */
        }
        .masonry-item {
          break-inside: avoid;
          margin-bottom: 16px;
        }
        .masonry-overlay {
          pointer-events: none;
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          border-radius: 12px;
          background: rgba(32,32,32,0);
          transition: background 0.18s;
        }
        .masonry-item:hover .masonry-overlay,
        .masonry-item:active .masonry-overlay {
          background: rgba(32,32,32,0.28);
        }
      `}</style>
    </div>
  );
};

export default AlbumGrid;

