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
  const [imgNatural, setImgNatural] = useState<{w: number, h: number}>({w: 4, h: 3});

  React.useEffect(() => {
    if (!previewUrl) return;
    const img = new window.Image();
    img.onload = () => setImgNatural({w: img.naturalWidth, h: img.naturalHeight});
    img.src = previewUrl;
  }, [previewUrl]);

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
        // Step 1: Get signed upload URL
        const res = await fetch('/api/upload-url');
        const { url } = await res.json();

        // Step 2: Upload file to blob URL
        const uploadRes = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type,
            },
            body: file,
        });

        if (!uploadRes.ok) {
            throw new Error('Failed to upload file to Blob storage');
        }

        // Step 3: Save photo metadata to DB
        const blob_url = url.split('?')[0]; // remove query params
        const saveRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                album_id,
                blob_url,
                description,
                mime_type: file.type,
            }),
        });

        if (!saveRes.ok) {
            const data = await saveRes.json();
            throw new Error(data.error || 'Failed to save photo');
        }

        // Clean up
        setFile(null);
        setPreviewUrl(null);
        setDescription('');
        onPhotoAdded?.();
        onClose();
    } catch (err: any) {
        setError(err.message || 'Upload failed');
    } finally {
        setLoading(false);
    }
  };
  

  // Responsive font sizing based on modal width
  let fontScale = 1;
  if (typeof window !== 'undefined') {
    // Use modal width as basis for scaling
    const marginW = Math.max(window.innerWidth * 0.05, 32);
    const maxBoxW = window.innerWidth - 2 * marginW;
    fontScale = Math.max(1, Math.min(1.5, maxBoxW / 600)); // scale up to 1.5x for very large modals
  }

  // Responsive font sizing based on modal width
  const titleFontSize = `${1.3 * fontScale}rem`;
  const descFontSize = `${1.0 * fontScale}rem`;
  const btnFontSize = `${1.0 * fontScale}rem`;
  const placeholderFontSize = `${1.1 * fontScale}rem`;

  return (
    <div className="addphoto-overlay" onClick={onClose}>
      {(() => {
        const marginW = Math.max(window.innerWidth * 0.05, 32);
        const marginH = Math.max(window.innerHeight * 0.05, 32);
        const maxBoxW = window.innerWidth - 2 * marginW;
        const maxBoxH = window.innerHeight - 2 * marginH;
        const modalPaddingX = 18;
        const modalPaddingY = 22;
        const topBarHeight = 44;
        const descInputHeight = 80;
        const footerHeight = 56;
        const reservedHeight = topBarHeight + descInputHeight + footerHeight + modalPaddingY * 2 + 24;
        const reservedWidth = modalPaddingX * 2;
        const aspect = previewUrl ? imgNatural.w / imgNatural.h : 4 / 3;
        const boxW = maxBoxW - reservedWidth;
        const boxH = maxBoxH - reservedHeight;
        let fitW = boxW;
        let fitH = boxW / aspect;
        if (fitH > boxH) {
          fitH = boxH;
          fitW = boxH * aspect;
        }
        const modalW = fitW + reservedWidth;
        const modalH = fitH + reservedHeight;
        return (
          <div
            className="addphoto-modal"
            onClick={e => e.stopPropagation()}
            style={{
              background: '#23232b',
              borderRadius: 18,
              padding: `${modalPaddingY}px ${modalPaddingX}px`,
              boxShadow: '0 8px 40px 0 rgba(0,0,0,0.55), 0 1.5px 8px 0 rgba(0,0,0,0.22)',
              maxWidth: modalW,
              maxHeight: modalH,
              width: modalW,
              height: modalH,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2100,
            }}
          >
            <button className="close-btn" onClick={onClose} aria-label="Close">&times;</button>
            <h2 style={{marginTop: 0, marginBottom: 16, fontSize: titleFontSize, color: '#f4f4f4'}}>Add Photo</h2>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div className="preview-container" onClick={() => fileInputRef.current?.click()} style={{width: '100%', height: fitH, marginBottom: 16}}>
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={fitW}
                  height={fitH}
                  style={{
                    width: fitW,
                    height: fitH,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    borderRadius: '12px',
                    display: 'block',
                    objectFit: 'contain',
                    background: '#181818',
                  }}
                  sizes="100vw"
                />
              ) : (
                <div className="preview-placeholder" style={{height: fitH, lineHeight: `${fitH}px`, fontSize: placeholderFontSize, background: '#181818', color: '#f4f4f4'}}>Click to select a photo</div>
              )}
            </div>
            <textarea
              className="desc-input"
              placeholder="Add a description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={{marginBottom: 16, fontSize: descFontSize, color: '#f4f4f4', background: '#23232b', border: '1px solid #39394a'}}
            />
            <div className="footer">
              <button className="add-btn" onClick={handleAddPhoto} disabled={loading} style={{fontSize: btnFontSize, background: '#d7263d', color: '#fff'}}>
                {loading ? 'Adding...' : 'Add'}
              </button>
              {error && <div className="error">{error}</div>}
            </div>
          </div>
        );
      })()}
      <style jsx>{`
        .addphoto-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.72);
          z-index: 2000;
          backdrop-filter: blur(2.5px);
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
  );
};

export default AddPhoto;
