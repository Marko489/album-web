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

interface PhotoLookupProps {
  photo: Photo;
  onClose: () => void;
}

const PhotoLookup: React.FC<PhotoLookupProps> = ({ photo, onClose }) => {
  return (
    <div className="lookup-overlay" onClick={onClose}>
      <div className="lookup-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close">&times;</button>
        <img
          src={photo.blob_url}
          alt={photo.description || 'Album photo'}
          className="lookup-img"
        />
        <div className="lookup-description">
          {photo.description || <em>No description</em>}
        </div>
        <style jsx>{`
          .lookup-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }
          .lookup-modal {
            background: #fff;
            border-radius: 18px;
            padding: 2rem 2rem 1.5rem 2rem;
            box-shadow: 0 4px 32px rgba(0,0,0,0.18);
            max-width: 90vw;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
          }
          .close-btn {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            font-size: 2rem;
            color: #888;
            cursor: pointer;
            z-index: 1;
            transition: color 0.2s;
          }
          .close-btn:hover {
            color: #222;
          }
          .lookup-img {
            max-width: 70vw;
            max-height: 60vh;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            margin-bottom: 1.5rem;
            background: #f3f3f3;
          }
          .lookup-description {
            font-size: 1.1rem;
            color: #333;
            text-align: center;
            margin-top: 0.5rem;
            word-break: break-word;
          }
        `}</style>
      </div>
    </div>
  );
};

export default PhotoLookup;
