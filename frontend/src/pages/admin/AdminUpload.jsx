import React, { useState, useRef } from 'react';
import { FiUpload, FiFile, FiX, FiCheck } from 'react-icons/fi';
import { materialService } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUpload() {
  const [form, setForm] = useState({
    title: '', description: '', category: '', subject: '',
    accessType: 'free', downloadAllowed: 'true', tags: ''
  });
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
    if (!allowed.includes(f.type)) return toast.error('Unsupported file type. Use PDF, image, or video.');
    if (f.size > 500 * 1024 * 1024) return toast.error('File too large. Max 500MB.');
    setFile(f);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file.');
    if (!form.title || !form.category) return toast.error('Title and category are required.');

    setUploading(true);
    setProgress(0);
    try {
      const fd = new FormData();
      fd.append('file', file);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));

      await materialService.upload(fd, setProgress);
      setSuccess(true);
      setFile(null);
      setForm({ title: '', description: '', category: '', subject: '', accessType: 'free', downloadAllowed: 'true', tags: '' });
      if (fileRef.current) fileRef.current.value = '';
      toast.success('Material uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Upload Material</h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '14px' }}>Add new study materials for students</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* File Drop Zone */}
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--blue-400)'; }}
          onDragLeave={e => { e.currentTarget.style.borderColor = file ? 'var(--blue-400)' : 'var(--slate-300)'; }}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { const ev = { target: { files: [f] } }; handleFile(ev); } }}
          style={{
            border: `2px dashed ${file ? 'var(--blue-400)' : 'var(--slate-300)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '40px',
            textAlign: 'center',
            cursor: 'pointer',
            background: file ? 'var(--blue-50)' : 'white',
            marginBottom: '24px',
            transition: 'all 0.2s'
          }}
        >
          <input ref={fileRef} type="file" hidden accept=".pdf,image/*,video/*" onChange={handleFile} />
          {file ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', justifyContent: 'center' }}>
              <div style={{ width: 48, height: 48, background: 'var(--blue-100)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiFile size={22} style={{ color: 'var(--blue-600)' }} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--slate-800)' }}>{file.name}</p>
                <p style={{ fontSize: '13px', color: 'var(--slate-500)' }}>{formatSize(file.size)} · {file.type}</p>
              </div>
              <button type="button" onClick={e => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                style={{ marginLeft: 'auto', color: 'var(--danger)', padding: '4px', borderRadius: '6px' }}>
                <FiX size={18} />
              </button>
            </div>
          ) : (
            <>
              <FiUpload size={36} style={{ color: 'var(--blue-300)', margin: '0 auto 14px' }} />
              <p style={{ fontWeight: 600, color: 'var(--slate-700)', marginBottom: '6px' }}>Click or drag & drop a file</p>
              <p style={{ fontSize: '13px', color: 'var(--slate-400)' }}>PDF, Images (JPG, PNG, WebP), Videos (MP4, WebM) · Max 500MB</p>
            </>
          )}
        </div>

        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Title *</label>
              <input type="text" placeholder="e.g. Chapter 1 - Introduction to Physics" value={form.title}
                onChange={e => setForm(f => ({...f, title: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <input type="text" placeholder="e.g. Physics, Mathematics" value={form.category}
                onChange={e => setForm(f => ({...f, category: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input type="text" placeholder="e.g. Class 12, NEET, JEE" value={form.subject}
                onChange={e => setForm(f => ({...f, subject: e.target.value}))} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Description</label>
              <textarea placeholder="Brief description of this material..." value={form.description}
                onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={3} />
            </div>
            <div className="form-group">
              <label>Access Type</label>
              <select value={form.accessType} onChange={e => setForm(f => ({...f, accessType: e.target.value}))}>
                <option value="free">🆓 Free — Everyone</option>
                <option value="members_only">⭐ Members Only</option>
              </select>
            </div>
            <div className="form-group">
              <label>Download Permission</label>
              <select value={form.downloadAllowed} onChange={e => setForm(f => ({...f, downloadAllowed: e.target.value}))}>
                <option value="true">✅ Downloads Allowed</option>
                <option value="false">🚫 View Only (No Download)</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Tags (comma-separated)</label>
              <input type="text" placeholder="e.g. physics, chapter1, waves, neet" value={form.tags}
                onChange={e => setForm(f => ({...f, tags: e.target.value}))} />
            </div>
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', color: 'var(--slate-600)' }}>
                <span>Uploading…</span><span>{progress}%</span>
              </div>
              <div style={{ height: '6px', background: 'var(--slate-200)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'var(--blue-600)', borderRadius: '3px', transition: 'width 0.3s' }} />
              </div>
            </div>
          )}

          <button type="submit" disabled={uploading || !file} className="btn btn-primary" style={{ padding: '12px 32px' }}>
            {uploading ? `Uploading ${progress}%…` : success ? <><FiCheck /> Uploaded!</> : <><FiUpload /> Upload Material</>}
          </button>
        </div>
      </form>
    </div>
  );
}
