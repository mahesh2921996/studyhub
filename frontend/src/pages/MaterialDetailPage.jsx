import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiDownload, FiArrowLeft, FiLock, FiEye, FiFileText, FiImage, FiVideo } from 'react-icons/fi';
import { materialService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

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

  const handleDownload = async () => {
    if (!user) { toast.error('Please log in to download'); return navigate('/login'); }
    if (!isMember() && !isAdmin()) { toast.error('Membership required to download'); return navigate('/membership'); }
    setDownloading(true);
    try {
      const res = await materialService.download(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = material.originalName || material.title;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Download started!');
    } catch {
      toast.error('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const getToken = () => localStorage.getItem('studyhub_token') || '';
  const fileUrl = material?.fileUrl
    ? `${material.fileUrl}?token=${getToken()}`
    : null;

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
            <button onClick={handleDownload} disabled={downloading} className="btn btn-primary btn-sm">
              <FiDownload size={14} /> {downloading ? 'Downloading…' : 'Download'}
            </button>
          )}
        </div>
      </div>

      <div className="container" style={{ padding: '32px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '28px' }}>
          {/* Viewer */}
          <div ref={viewerRef} style={{ userSelect: isAccessible ? 'auto' : 'none' }}>
            {!isAccessible ? (
              /* ── Locked State ── */
              <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '2px dashed var(--blue-200)', padding: '80px 40px', textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, background: 'var(--blue-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
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
              <div style={{ background: 'var(--slate-800)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', minHeight: '700px' }}>
                <iframe
                  src={fileUrl}
                  width="100%"
                  height="700px"
                  style={{ border: 'none', display: 'block' }}
                  title={material.title}
                />
              </div>
            ) : material.fileType === 'image' ? (
              /* ── Image Preview ── */
              <div style={{ background: 'var(--slate-900)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '500px', padding: '24px' }}>
                <img
                  src={fileUrl}
                  alt={material.title}
                  style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', borderRadius: '8px' }}
                  onContextMenu={e => { if (!isMember() && !isAdmin()) e.preventDefault(); }}
                />
              </div>
            ) : material.fileType === 'video' ? (
              /* ── Video Player ── */
              <div style={{ background: 'black', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
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
                { label: 'Size', value: material.fileSize ? `${(material.fileSize/1024/1024).toFixed(2)} MB` : '—' },
                { label: 'Views', value: material.viewCount || 0 },
                { label: 'Downloads', value: material.downloadCount || 0 },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--slate-100)', fontSize: '13px' }}>
                  <span style={{ color: 'var(--slate-500)' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{value}</span>
                </div>
              ))}
            </div>

            {material.description && (
              <div className="card" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '15px', marginBottom: '12px' }}>Description</h3>
                <p style={{ fontSize: '13px', color: 'var(--slate-600)', lineHeight: 1.7 }}>{material.description}</p>
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
          </div>
        </div>
      </div>
    </div>
  );
}
