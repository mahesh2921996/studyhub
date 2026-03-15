import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiBook, FiDollarSign, FiStar, FiUpload, FiArrowRight } from 'react-icons/fi';
import { adminService } from '../../services/api';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '18px' }}>
    <div style={{ width: 52, height: 52, background: `${color}18`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={24} style={{ color }} />
    </div>
    <div>
      <p style={{ fontSize: '13px', color: 'var(--slate-500)', marginBottom: '4px' }}>{label}</p>
      <p style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--slate-900)', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: '12px', color: 'var(--slate-400)', marginTop: '4px' }}>{sub}</p>}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats()
      .then(r => setStats(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Dashboard</h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '14px' }}>Overview of your StudyHub platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <StatCard icon={FiUsers} label="Total Students" value={stats?.totalUsers ?? 0} color="#2563eb" />
        <StatCard icon={FiStar} label="Active Members" value={stats?.totalMembers ?? 0} color="#10b981" />
        <StatCard icon={FiBook} label="Study Materials" value={stats?.totalMaterials ?? 0} color="#8b5cf6" />
        <StatCard icon={FiDollarSign} label="Total Revenue" value={`₹${stats?.totalRevenue ?? 0}`} color="#f59e0b" />
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <Link to="/admin/upload" className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none', transition: 'all 0.2s', border: '2px dashed var(--blue-200)' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--blue-400)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--blue-200)'}
        >
          <div style={{ width: 48, height: 48, background: 'var(--blue-100)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiUpload size={22} style={{ color: 'var(--blue-600)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '15px', marginBottom: '4px' }}>Upload Material</h3>
            <p style={{ fontSize: '13px', color: 'var(--slate-500)' }}>Add new study content</p>
          </div>
          <FiArrowRight style={{ color: 'var(--slate-400)' }} />
        </Link>

        <Link to="/admin/users" className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none', transition: 'all 0.2s', border: '2px dashed var(--slate-200)' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--slate-400)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--slate-200)'}
        >
          <div style={{ width: 48, height: 48, background: 'var(--slate-100)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiUsers size={22} style={{ color: 'var(--slate-600)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '15px', marginBottom: '4px' }}>Manage Users</h3>
            <p style={{ fontSize: '13px', color: 'var(--slate-500)' }}>View & manage students</p>
          </div>
          <FiArrowRight style={{ color: 'var(--slate-400)' }} />
        </Link>
      </div>

      {/* Recent Payments */}
      {stats?.recentPayments?.length > 0 && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>Recent Payments</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--slate-50)' }}>
                {['User', 'Email', 'Amount', 'Gateway', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentPayments.map(p => (
                <tr key={p._id} style={{ borderTop: '1px solid var(--slate-100)' }}>
                  <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: 600 }}>{p.user?.name}</td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--slate-500)' }}>{p.user?.email}</td>
                  <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: 700, color: 'var(--blue-700)' }}>₹{p.amount}</td>
                  <td style={{ padding: '12px 14px' }}><span className="badge badge-blue">{p.gateway}</span></td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: 'var(--slate-500)' }}>{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
