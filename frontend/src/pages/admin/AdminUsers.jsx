import React, { useState, useEffect } from 'react';
import { FiSearch, FiUserCheck, FiUserX, FiStar } from 'react-icons/fi';
import { adminService } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      const res = await adminService.getUsers(params);
      setUsers(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const handleToggle = async (user) => {
    try {
      await adminService.toggleUser(user._id);
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch {
      toast.error('Update failed');
    }
  };

  const handleMembership = async (user) => {
    const newStatus = !user.isMember;
    try {
      await adminService.updateMembership(user._id, { isMember: newStatus, membershipExpiry: newStatus ? null : undefined });
      toast.success(`Membership ${newStatus ? 'granted' : 'revoked'}`);
      fetchUsers();
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Users</h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '14px' }}>{pagination.total || 0} registered students</p>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: 'white', border: '1.5px solid var(--slate-200)', borderRadius: 'var(--radius-md)', padding: '0 14px' }}>
          <FiSearch size={16} style={{ color: 'var(--slate-400)' }} />
          <input type="text" placeholder="Search by name or email…" value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchUsers()}
            style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 0', fontSize: '14px' }}
          />
        </div>
        <button onClick={fetchUsers} className="btn btn-secondary">Search</button>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--slate-50)' }}>
                <tr>
                  {['Name', 'Email', 'Membership', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderTop: '1px solid var(--slate-100)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 32, height: 32, background: 'var(--blue-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'var(--blue-700)', flexShrink: 0 }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--slate-600)' }}>{u.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      {u.isMember
                        ? <span className="badge badge-green"><FiStar size={10} /> Member</span>
                        : <span className="badge badge-gray">Free</span>
                      }
                      {u.membershipExpiry && (
                        <p style={{ fontSize: '11px', color: 'var(--slate-400)', marginTop: '2px' }}>
                          Exp: {new Date(u.membershipExpiry).toLocaleDateString('en-IN')}
                        </p>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--slate-500)' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleMembership(u)}
                          className="btn btn-sm"
                          title={u.isMember ? 'Revoke membership' : 'Grant membership'}
                          style={{ background: u.isMember ? '#fef3c7' : '#d1fae5', color: u.isMember ? '#92400e' : '#065f46', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          <FiStar size={12} /> {u.isMember ? 'Revoke' : 'Grant'}
                        </button>
                        <button
                          onClick={() => handleToggle(u)}
                          className="btn btn-sm"
                          title={u.isActive ? 'Deactivate' : 'Activate'}
                          style={{ background: u.isActive ? '#fee2e2' : '#d1fae5', color: u.isActive ? '#991b1b' : '#065f46', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          {u.isActive ? <><FiUserX size={12} /> Disable</> : <><FiUserCheck size={12} /> Enable</>}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--slate-400)', fontSize: '14px' }}>No users found.</div>
            )}
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'center' }}>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
