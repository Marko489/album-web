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
  const [columns, setColumns] = React.useState(2);
  // Helper to get image aspect ratio
  const [imgNatural, setImgNatural] = React.useState<{w: number, h: number}>({w: 4, h: 3});

  React.useEffect(() => {
    function updateColumns() {
      if (typeof window !== 'undefined') {
        const effectiveWidth = Math.min(window.innerWidth, 1500);
        if (effectiveWidth <= 600 && window.innerHeight > window.innerWidth) {
          setColumns(2);
        } else {
          setColumns(Math.max(2, Math.ceil(effectiveWidth / 450)));
        }
      }
    }
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  React.useEffect(() => {
    if (!photo?.blob_url) return;
    const img = new window.Image();
    img.onload = () => setImgNatural({w: img.naturalWidth, h: img.naturalHeight});
    img.src = photo.blob_url;
  }, [photo?.blob_url]);

  // Responsive modal and element sizing
  let modalMaxWidth = 0;
  let modalMaxHeight = 0;
  let modalPaddingX = 6;
  let modalPaddingY = 8;
  let modalRadius = 5;
  let imageMaxWidth = 0;
  let imageMaxHeight = 0;
  let topBarHeight = 28;
  let closeBtnFont = 20;
  let deleteBtnFont = 0.82;
  let deleteBtnPadY = 2;
  let deleteBtnPadX = 8;
  let deleteBtnRadius = 6;
  let descFont = 0.92;
  let descMarginTop = 10;
  if (typeof window !== 'undefined') {
    // Margin from viewport edge
    const marginW = Math.max(window.innerWidth * 0.05, 32);
    const marginH = Math.max(window.innerHeight * 0.05, 32);
    const maxBoxW = window.innerWidth - 2 * marginW;
    const maxBoxH = window.innerHeight - 2 * marginH;
    if (window.innerWidth <= 600 && window.innerHeight > window.innerWidth) {
      modalPaddingX = 8;
      modalPaddingY = 14;
      modalRadius = 5;
      topBarHeight = 24;
      closeBtnFont = 22;
      deleteBtnFont = 0.74;
      deleteBtnPadY = 1;
      deleteBtnPadX = 7;
      deleteBtnRadius = 4;
      descFont = 0.82;
      descMarginTop = 7;
    } else {
      modalPaddingX = 16 + columns * 2.2;
      modalPaddingY = 18 + columns * 2.2;
      modalRadius = 5 + columns * 0.5;
      topBarHeight = 18 + columns * 1.2;
      closeBtnFont = 18 + columns * 2.2;
      deleteBtnFont = 0.68 + columns * 0.06;
      deleteBtnPadY = 1 + columns * 0.5;
      deleteBtnPadX = 6 + columns * 0.7;
      deleteBtnRadius = 4 + columns * 0.5;
      descFont = 0.78 + columns * 0.06;
      descMarginTop = 7 + columns * 0.7;
    }
    // Calculate available space for image (subtract modal paddings, top bar, desc)
    const reservedHeight = topBarHeight + descMarginTop + modalPaddingY * 2 + 40; // 40 for description height estimate
    const reservedWidth = modalPaddingX * 2;
    const boxW = maxBoxW - reservedWidth;
    const boxH = maxBoxH - reservedHeight;
    // Fit image to box, maintaining aspect ratio
    const aspect = imgNatural.w / imgNatural.h;
    let fitW = boxW;
    let fitH = boxW / aspect;
    if (fitH > boxH) {
      fitH = boxH;
      fitW = boxH * aspect;
    }
    imageMaxWidth = fitW;
    imageMaxHeight = fitH;
    // Modal size will hug the image
    modalMaxWidth = fitW + reservedWidth;
    modalMaxHeight = fitH + reservedHeight;
  }

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
      <div
        className="lookup-modal"
        onClick={e => e.stopPropagation()}
        style={{
          background: '#23232b',
          borderRadius: modalRadius,
          padding: `${modalPaddingY}px ${modalPaddingX}px`,
          boxShadow: '0 8px 40px 0 rgba(0,0,0,0.55), 0 1.5px 8px 0 rgba(0,0,0,0.22)',
          maxWidth: modalMaxWidth,
          maxHeight: modalMaxHeight,
          width: 'auto',
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2100,
        }}
      >
        {/* Top bar with delete and close */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: topBarHeight,
          marginBottom: 8,
        }}>
          <button
            className="delete-btn"
            onClick={handleDelete}
            disabled={loading}
            aria-label="Delete Photo"
            style={{
              background: '#d7263d',
              color: '#fff',
              border: 'none',
              borderRadius: deleteBtnRadius,
              padding: `${deleteBtnPadY}px ${deleteBtnPadX}px`,
              fontSize: `${deleteBtnFont}rem`,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(215,38,61,0.10)',
              transition: 'background 0.2s',
              zIndex: 2,
              minWidth: 0,
              minHeight: 0,
              fontWeight: 600,
              letterSpacing: '0.01em',
              display: 'inline-block',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '...' : 'Delete'}
          </button>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              fontSize: closeBtnFont,
              color: '#888',
              cursor: 'pointer',
              zIndex: 1,
              transition: 'color 0.2s',
              lineHeight: 1,
              marginLeft: 8,
            }}
          >
            &times;
          </button>
        </div>
        {/* Main image */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 0,
          minWidth: 0,
        }}>
          <Image
            src={photo.blob_url}
            alt={photo.description || 'Album photo'}
            width={imageMaxWidth}
            height={imageMaxHeight}
            style={{
              width: imageMaxWidth,
              height: imageMaxHeight,
              maxWidth: imageMaxWidth,
              maxHeight: imageMaxHeight,
              borderRadius: modalRadius - 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.22)',
              background: '#181818',
              objectFit: 'contain',
              display: 'block',
            }}
            sizes="(max-width: 900px) 90vw, 700px"
            priority={true}
          />
        </div>
        {/* Description at the bottom */}
        <div
          className="lookup-description"
          style={{
            fontSize: `${descFont}rem`,
            color: '#f4f4f4',
            textAlign: 'left',
            marginTop: descMarginTop,
            marginBottom: 0,
            wordBreak: 'break-word',
            maxWidth: '100%',
            paddingLeft: 2,
            paddingRight: 2,
          }}
        >
          {photo.description || <em>No description</em>}
        </div>
        {error && <div className="delete-error">{error}</div>}
        <style jsx>{`
          .lookup-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.72);
            z-index: 2000;
            backdrop-filter: blur(2.5px);
          }
          .close-btn:hover {
            color: #222;
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
