import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiEye, FiSearch, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { materialService } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [editModal, setEditModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      const res = await materialService.getAll(params);
      setMaterials(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMaterials(); }, [page]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await materialService.delete(id);
      toast.success('Material deleted');
      fetchMaterials();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleToggleActive = async (m) => {
    try {
      await materialService.update(m._id, { ...m, isActive: !m.isActive });
      toast.success(`Material ${m.isActive ? 'hidden' : 'shown'}`);
      fetchMaterials();
    } catch {
      toast.error('Update failed');
    }
  };

  const handleEditSave = async () => {
    setSaving(true);
    try {
      await materialService.update(editModal._id, editModal);
      toast.success('Material updated');
      setEditModal(null);
      fetchMaterials();
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const typeColors = { pdf: '#ef4444', image: '#8b5cf6', video: '#f59e0b' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Study Materials</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '14px' }}>{pagination.total || 0} total materials</p>
        </div>
        <Link to="/admin/upload" className="btn btn-primary">+ Upload New</Link>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 'var(--radius-md)', padding: '0 14px' }}>
          <FiSearch size={16} style={{ color: 'var(--slate-400)' }} />
          <input
            type="text" placeholder="Search materials…"
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchMaterials()}
            style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 0', fontSize: '14px' }}
          />
        </div>
        <button onClick={fetchMaterials} className="btn btn-secondary">Search</button>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--slate-50)' }}>
                <tr>
                  {['Title', 'Type', 'Category', 'Access', 'Download', 'Views', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {materials.map(m => (
                  <tr key={m._id} style={{ borderTop: '1px solid var(--slate-100)', opacity: m.isActive ? 1 : 0.5 }}>
                    <td style={{ padding: '14px 16px', maxWidth: '200px' }}>
                      <p style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</p>
                      {m.subject && <p style={{ fontSize: '12px', color: 'var(--slate-400)' }}>{m.subject}</p>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge" style={{ background: `${typeColors[m.fileType]}18`, color: typeColors[m.fileType] }}>{m.fileType?.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--slate-600)' }}>{m.category}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${m.accessType === 'free' ? 'badge-green' : 'badge-orange'}`}>
                        {m.accessType === 'free' ? 'Free' : 'Members'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${m.downloadAllowed ? 'badge-green' : 'badge-red'}`}>
                        {m.downloadAllowed ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--slate-500)' }}>{m.viewCount || 0}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => handleToggleActive(m)} style={{ color: m.isActive ? 'var(--success)' : 'var(--slate-400)', padding: '4px' }}>
                        {m.isActive ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                      </button>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link to={`/materials/${m._id}`} className="btn btn-ghost btn-sm" title="View"><FiEye size={14} /></Link>
                        <button onClick={() => setEditModal({ ...m, tags: m.tags?.join(', ') })} className="btn btn-ghost btn-sm" title="Edit"><FiEdit2 size={14} /></button>
                        <button onClick={() => handleDelete(m._id, m.title)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} title="Delete"><FiTrash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {materials.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--slate-400)', fontSize: '14px' }}>No materials found.</div>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'center' }}>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}>{p}</button>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ padding: '32px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.2rem' }}>Edit Material</h2>
              <button onClick={() => setEditModal(null)} style={{ color: 'var(--slate-400)', padding: '4px' }}>✕</button>
            </div>
            {[
              { label: 'Title', key: 'title', type: 'text' },
              { label: 'Category', key: 'category', type: 'text' },
              { label: 'Subject', key: 'subject', type: 'text' },
              { label: 'Tags', key: 'tags', type: 'text' },
            ].map(({ label, key, type }) => (
              <div className="form-group" key={key}>
                <label>{label}</label>
                <input type={type} value={editModal[key] || ''} onChange={e => setEditModal(m => ({...m, [key]: e.target.value}))} />
              </div>
            ))}
            <div className="form-group">
              <label>Description</label>
              <textarea value={editModal.description || ''} onChange={e => setEditModal(m => ({...m, description: e.target.value}))} rows={3} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Access Type</label>
                <select value={editModal.accessType} onChange={e => setEditModal(m => ({...m, accessType: e.target.value}))}>
                  <option value="free">Free</option>
                  <option value="members_only">Members Only</option>
                </select>
              </div>
              <div className="form-group">
                <label>Download</label>
                <select value={editModal.downloadAllowed} onChange={e => setEditModal(m => ({...m, downloadAllowed: e.target.value === 'true'}))}>
                  <option value="true">Allowed</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditModal(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleEditSave} disabled={saving} className="btn btn-primary">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
