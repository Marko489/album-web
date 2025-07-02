import React from 'react';
import Image from 'next/image';


interface PhotoLookupProps {
  photo: Photo;
  onClose: () => void;
  onPhotoDeleted?: () => void;
}

const PhotoLookup: React.FC<PhotoLookupProps> = ({ photo, onClose, onPhotoDeleted }) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleDelete = async () => {
    if (!photo.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/delete_photo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: photo.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete photo');
      }
      onClose();
      onPhotoDeleted?.();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete photo');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lookup-overlay" onClick={onClose}>
      <div className="lookup-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close">&times;</button>
        <Image
          src={photo.blob_url}
          alt={photo.description || 'Album photo'}
          width={700}
          height={500}
          style={{
            maxWidth: '70vw',
            maxHeight: '60vh',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            marginBottom: '1.5rem',
            background: '#f3f3f3',
            objectFit: 'contain',
            width: '100%',
            height: 'auto',
          }}
          sizes="(max-width: 900px) 90vw, 700px"
          priority={true}
        />
        <div className="lookup-description">
          {photo.description || <em>No description</em>}
        </div>
        {error && <div className="delete-error">{error}</div>}
        <button
          className="delete-btn"
          onClick={handleDelete}
          disabled={loading}
          aria-label="Delete Photo"
        >
          {loading ? 'Deleting...' : 'Delete'}
        </button>
        <style jsx>{`
          .lookup-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.72);
            z-index: 2000;
            backdrop-filter: blur(2.5px);
          }
          .lookup-modal {
            background: #fff;
            border-radius: 18px;
            padding: 2rem 2rem 1.5rem 2rem;
            box-shadow: 0 8px 40px 0 rgba(0,0,0,0.28), 0 1.5px 8px 0 rgba(0,0,0,0.10);
            max-width: 90vw;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 2100;
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
          .lookup-description {
            font-size: 1.1rem;
            color: #333;
            text-align: center;
            margin-top: 0.5rem;
            word-break: break-word;
          }
          .delete-btn {
            position: absolute;
            bottom: 1.2rem;
            right: 1.5rem;
            background: #e53935;
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 0.5rem 1.5rem;
            font-size: 1rem;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(229,57,53,0.08);
            transition: background 0.2s;
            z-index: 2;
          }
          .delete-btn:disabled {
            background: #b71c1c;
            cursor: not-allowed;
          }
          .delete-btn:hover:not(:disabled) {
            background: #b71c1c;
          }
          .delete-error {
            color: #e53935;
            font-size: 1rem;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
            text-align: center;
          }
        `}</style>
      </div>
    </div>
  );
};

export default PhotoLookup;
