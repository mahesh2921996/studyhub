import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiDownload, FiArrowLeft, FiLock, FiEye, FiFileText, FiImage, FiVideo } from 'react-icons/fi';
import { materialService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ── Image Viewer with Zoom Controls ──────────────────────────
function ImageViewer({ src, alt, canSave, protectContent }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const zoomIn = () => setScale(s => Math.min(s + 0.25, 4));
  const zoomOut = () => setScale(s => Math.max(s - 0.25, 0.5));
  const resetZoom = () => { setScale(1); setPosition({ x: 0, y: 0 }); };

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setScale(s => Math.min(s + 0.1, 4));
    } else {
      setScale(s => Math.max(s - 0.1, 0.5));
    }
  };

  // Drag to pan when zoomed in
  const handleMouseDown = (e) => {
    if (scale > 1) {
      setDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setDragging(false);

  // Touch pinch zoom
  const lastTouchDistance = useRef(null);
  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (lastTouchDistance.current) {
        const delta = distance - lastTouchDistance.current;
        setScale(s => Math.min(Math.max(s + delta * 0.01, 0.5), 4));
      }
      lastTouchDistance.current = distance;
    }
  };
  const handleTouchEnd = () => { lastTouchDistance.current = null; };

  return (
    <div style={{
      background: 'var(--slate-900)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      minHeight: '500px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Zoom Controls Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        background: 'rgba(0,0,0,0.4)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <button
          onClick={zoomOut}
          style={{
            width: 32, height: 32,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            color: 'white',
            fontSize: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            lineHeight: 1
          }}
          title="Zoom Out"
        >−</button>

        <span style={{
          color: 'white',
          fontSize: '13px',
          minWidth: '48px',
          textAlign: 'center',
          fontFamily: 'var(--font-body)'
        }}>
          {Math.round(scale * 100)}%
        </span>

        <button
          onClick={zoomIn}
          style={{
            width: 32, height: 32,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            color: 'white',
            fontSize: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            lineHeight: 1
          }}
          title="Zoom In"
        >+</button>

        <button
          onClick={resetZoom}
          style={{
            padding: '4px 12px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            color: 'white',
            fontSize: '12px',
            cursor: 'pointer',
            marginLeft: '4px'
          }}
          title="Reset Zoom"
        >Reset</button>

        <span style={{
          marginLeft: 'auto',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '12px'
        }}>
          {scale > 1 ? 'Drag to pan' : 'Scroll to zoom'}
        </span>
      </div>

      {/* Image Container */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={e => { if (protectContent) e.preventDefault(); }}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '460px',
          overflow: 'hidden',
          cursor: scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'default',
          padding: '24px'
        }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={{
            maxWidth: '100%',
            maxHeight: '460px',
            objectFit: 'contain',
            borderRadius: '8px',
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transformOrigin: 'center center',
            transition: dragging ? 'none' : 'transform 0.15s ease',
            userSelect: 'none',
            WebkitUserDrag: 'none'
          }}
        />
      </div>

      {/* Bottom hint */}
      <div style={{
        padding: '8px 16px',
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px'
      }}>
        {[
          { key: '🖱️ Scroll', desc: 'Zoom' },
          { key: '✋ Drag', desc: 'Pan' },
          { key: '👌 Pinch', desc: 'Mobile zoom' },
        ].map(({ key, desc }) => (
          <span key={key} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
            {key} — {desc}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function MaterialDetailPage() {
  const { id } = useParams();
  const { user, isMember, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const viewerRef = useRef(null);

  useEffect(() => {
    materialService.getOne(id)
      .then(r => setMaterial(r.data.data))
      .catch(() => { toast.error('Material not found'); navigate('/'); })
      .finally(() => setLoading(false));
  }, [id]);

  // Disable right-click and copy for non-members on premium content
  useEffect(() => {
    if (!material || material.accessType === 'free' || isMember() || isAdmin()) return;
    const el = viewerRef.current;
    if (!el) return;
    const prevent = e => e.preventDefault();
    el.addEventListener('contextmenu', prevent);
    el.addEventListener('copy', prevent);
    return () => {
      el.removeEventListener('contextmenu', prevent);
      el.removeEventListener('copy', prevent);
    };
  }, [material]);

  // Get file URL
  const fileUrl = material?.fileUrl || null;

  // Handle download — fetch as blob so it downloads directly
  // const handleDownload = async () => {
  //   if (!user) { toast.error('Please log in to download'); return navigate('/login'); }
  //   if (!isMember() && !isAdmin()) { toast.error('Membership required to download'); return navigate('/membership'); }

  //   setDownloading(true);
  //   try {
  //     if (fileUrl && fileUrl.startsWith('http')) {
  //       // Fetch file as blob then force download
  //       const response = await fetch(fileUrl);
  //       const blob = await response.blob();
  //       const blobUrl = window.URL.createObjectURL(blob);
  //       const a = document.createElement('a');
  //       a.href = blobUrl;
  //       a.download = material.originalName || material.title;
  //       document.body.appendChild(a);
  //       a.click();
  //       document.body.removeChild(a);
  //       window.URL.revokeObjectURL(blobUrl);
  //       toast.success('Download started!');
  //     } else {
  //       // Local storage download
  //       const res = await materialService.download(material._id);
  //       const url = window.URL.createObjectURL(new Blob([res.data]));
  //       const a = document.createElement('a');
  //       a.href = url;
  //       a.download = material.originalName || material.title;
  //       a.click();
  //       window.URL.revokeObjectURL(url);
  //       toast.success('Download started!');
  //     }
  //   } catch {
  //     toast.error('Download failed. Please try again.');
  //   } finally {
  //     setDownloading(false);
  //   }
  // };

  const handleDownload = async () => {
    if (!user) { toast.error('Please log in to download'); return navigate('/login'); }
    if (!isMember() && !isAdmin()) { toast.error('Membership required to download'); return navigate('/membership'); }

    setDownloading(true);
    try {
      // Track download count
      await materialService.download(material._id);

      if (fileUrl && fileUrl.startsWith('http')) {
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = material.originalName || material.title;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
        toast.success('Download started!');
      } else {
        const res = await materialService.download(material._id);
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = material.originalName || material.title;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Download started!');
      }
    } catch {
      toast.error('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!material) return null;

  const isAccessible = material.accessType === 'free' || isMember() || isAdmin();
  const canDownload = material.downloadAllowed && isAccessible;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--slate-50)' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--slate-200)', padding: '16px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
            <FiArrowLeft /> Back
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{material.title}</h1>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-blue">{material.category}</span>
              <span className="badge badge-gray">{material.fileType?.toUpperCase()}</span>
              {material.accessType === 'members_only'
                ? <span className="badge badge-orange"><FiLock size={10} /> Premium</span>
                : <span className="badge badge-green">Free</span>}
            </div>
          </div>
          {canDownload && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn btn-primary btn-sm"
            >
              <FiDownload size={14} />
              {downloading ? 'Downloading…' : 'Download'}
            </button>
          )}
        </div>
      </div>

      <div className="container" style={{ padding: '32px 20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '28px'
        }}>
          {/* Viewer */}
          <div ref={viewerRef} style={{ userSelect: isAccessible ? 'auto' : 'none' }}>
            {!isAccessible ? (
              /* ── Locked State ── */
              <div style={{
                background: 'white',
                borderRadius: 'var(--radius-xl)',
                border: '2px dashed var(--blue-200)',
                padding: '80px 40px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: 80, height: 80,
                  background: 'var(--blue-100)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <FiLock size={36} style={{ color: 'var(--blue-600)' }} />
                </div>
                <h2 style={{ marginBottom: 12 }}>Members Only Content</h2>
                <p style={{ color: 'var(--slate-500)', maxWidth: 360, margin: '0 auto 28px' }}>
                  This material is exclusive to members. Upgrade your plan to access all premium content.
                </p>
                <Link to="/membership" className="btn btn-primary btn-lg">
                  Become a Member
                </Link>
              </div>
            
            ) : material.fileType === 'pdf' ? (
              /* ── PDF Viewer ── */
              <div style={{
                background: 'var(--slate-800)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                minHeight: '700px',
                position: 'relative'
              }}>
                <iframe
                  src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                  width="100%"
                  height="700px"
                  className="pdf-iframe"
                  style={{ border: 'none', display: 'block' }}
                  title={material.title}
                />

                {/* When download is disabled — cover the download/print/save
                    buttons in the top-right corner of the PDF toolbar */}
                {!canDownload && (
                  <>
                    {/* Covers download, print, save buttons on Chrome/Edge */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '120px',
                      height: '40px',
                      background: '#2d3748',
                      zIndex: 10,
                      borderRadius: '0 0 0 6px'
                    }} />
                    {/* Small label so user knows why buttons are hidden */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '120px',
                      height: '40px',
                      background: '#1e293b',
                      zIndex: 11,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      borderRadius: '0 var(--radius-lg) 0 6px'
                    }}>
                      <FiLock size={11} style={{ color: '#94a3b8' }} />
                      <span style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        fontFamily: 'var(--font-body)'
                      }}>
                        No download
                      </span>
                    </div>
                  </>
                )}
              </div>

            // ) : material.fileType === 'pdf' ? (
            //   /* ── PDF Viewer ── */
            //   <div style={{
            //     background: 'var(--slate-800)',
            //     borderRadius: 'var(--radius-lg)',
            //     overflow: 'hidden',
            //     minHeight: '700px'
            //   }}>
            //     <iframe
            //       src={fileUrl}
            //       width="100%"
            //       height="700px"
            //       style={{ border: 'none', display: 'block' }}
            //       title={material.title}
            //     />
            //   </div>
            
            ) : material.fileType === 'image' ? (
              /* ── Image Preview with Zoom ── */
              <ImageViewer
                src={fileUrl}
                alt={material.title}
                canSave={canDownload}
                protectContent={!isMember() && !isAdmin()}
              />

            // ) : material.fileType === 'image' ? (
            //   /* ── Image Preview ── */
            //   <div style={{
            //     background: 'var(--slate-900)',
            //     borderRadius: 'var(--radius-lg)',
            //     overflow: 'hidden',
            //     display: 'flex',
            //     alignItems: 'center',
            //     justifyContent: 'center',
            //     minHeight: '500px',
            //     padding: '24px'
            //   }}>
            //     <img
            //       src={fileUrl}
            //       alt={material.title}
            //       style={{
            //         maxWidth: '100%',
            //         maxHeight: '600px',
            //         objectFit: 'contain',
            //         borderRadius: '8px'
            //       }}
            //       onContextMenu={e => {
            //         if (!isMember() && !isAdmin()) e.preventDefault();
            //       }}
            //     />
            //   </div>

            ) : material.fileType === 'video' ? (
              /* ── Video Player ── */
              <div style={{
                background: 'black',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden'
              }}>
                <video
                  controls
                  controlsList={canDownload ? '' : 'nodownload'}
                  style={{ width: '100%', maxHeight: '550px', display: 'block' }}
                  onContextMenu={e => e.preventDefault()}
                >
                  <source src={fileUrl} type={material.mimeType} />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : null}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', marginBottom: '16px' }}>Material Info</h3>
              {[
                { label: 'Type', value: material.fileType?.toUpperCase() },
                { label: 'Category', value: material.category },
                { label: 'Subject', value: material.subject || '—' },
                { label: 'Access', value: material.accessType === 'free' ? 'Free' : 'Members Only' },
                { label: 'Size', value: material.fileSize ? `${(material.fileSize / 1024 / 1024).toFixed(2)} MB` : '—' },
                { label: 'Views', value: material.viewCount || 0 },
                { label: 'Downloads', value: material.downloadCount || 0 },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--slate-100)',
                  fontSize: '13px'
                }}>
                  <span style={{ color: 'var(--slate-500)' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{value}</span>
                </div>
              ))}
            </div>

            {material.description && (
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '15px', marginBottom: '12px' }}>Description</h3>
                <p style={{ fontSize: '13px', color: 'var(--slate-600)', lineHeight: 1.7 }}>
                  {material.description}
                </p>
              </div>
            )}

            {material.tags?.length > 0 && (
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '15px', marginBottom: '12px' }}>Tags</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {material.tags.map(tag => (
                    <span key={tag} className="badge badge-blue">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile download button */}
            {canDownload && (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn btn-primary"
                style={{ justifyContent: 'center', display: 'none' }}
                id="mobile-download-btn"
              >
                <FiDownload size={14} />
                {downloading ? 'Downloading…' : 'Download'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          #mobile-download-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}