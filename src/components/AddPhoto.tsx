import React, { useRef, useState } from 'react';
import Image from 'next/image';

interface AddPhotoProps {
  album_id: string;
  onClose: () => void;
  onPhotoAdded?: () => void;
}

const AddPhoto: React.FC<AddPhotoProps> = ({ album_id, onClose, onPhotoAdded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setError(null);
    if (selected) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
      reader.readAsDataURL(selected);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleAddPhoto = async () => {
    if (!file) {
      setError('Please select a photo.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('album_id', album_id);
      formData.append('photo', file);
      formData.append('description', description);
      const res = await fetch('/api/add_photo', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add photo');
      }
      setFile(null);
      setPreviewUrl(null);
      setDescription('');
      onPhotoAdded?.();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to add photo');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addphoto-overlay" onClick={onClose}>
      <div className="addphoto-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close">&times;</button>
        <h2>Add Photo</h2>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <div className="preview-container" onClick={() => fileInputRef.current?.click()}>
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Preview"
              width={400}
              height={300}
              style={{
                maxWidth: '100%',
                maxHeight: '220px',
                borderRadius: '12px',
                display: 'block',
                objectFit: 'contain',
                background: '#f3f3f3',
              }}
              sizes="100vw"
            />
          ) : (
            <div className="preview-placeholder">Click to select a photo</div>
          )}
        </div>
        <textarea
          className="desc-input"
          placeholder="Add a description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
        />
        <div className="footer">
          <button className="add-btn" onClick={handleAddPhoto} disabled={loading}>
            {loading ? 'Adding...' : 'Add'}
          </button>
          {error && <div className="error">{error}</div>}
        </div>
        <style jsx>{`
          .addphoto-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.72);
            z-index: 2000;
            backdrop-filter: blur(2.5px);
          }
          .addphoto-modal {
            background: #fff;
            border-radius: 18px;
            padding: 2rem 2rem 1.5rem 2rem;
            box-shadow: 0 8px 40px 0 rgba(0,0,0,0.28), 0 1.5px 8px 0 rgba(0,0,0,0.10);
            max-width: 95vw;
            width: 400px;
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
          .preview-container {
            width: 100%;
            min-height: 180px;
            background: #f3f3f3;
            border-radius: 12px;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            overflow: hidden;
          }
          .preview-img {
            max-width: 100%;
            max-height: 220px;
            border-radius: 12px;
            display: block;
          }
          .preview-placeholder {
            color: #aaa;
            font-size: 1.1rem;
            text-align: center;
            padding: 2rem 0;
            width: 100%;
          }
          .desc-input {
            width: 100%;
            border-radius: 8px;
            border: 1px solid #ddd;
            padding: 0.5rem;
            margin-bottom: 1rem;
            font-size: 1rem;
            resize: vertical;
          }
          .footer {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 1rem;
          }
          .add-btn {
            background: #222;
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 0.5rem 1.5rem;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.2s;
          }
          .add-btn:disabled {
            background: #888;
            cursor: not-allowed;
          }
          .error {
            color: #c00;
            font-size: 0.95rem;
            margin-left: 1rem;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AddPhoto;
