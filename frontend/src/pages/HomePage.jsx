import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiBook, FiUsers, FiAward, FiArrowRight } from 'react-icons/fi';
import { materialService } from '../services/api';
import MaterialCard from '../components/student/MaterialCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function HomePage() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ category: '', type: '' });
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    materialService.getCategories()
      .then(r => setCategories(r.data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [page, filter]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9, ...filter };
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

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMaterials();
  };

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--blue-900) 0%, var(--blue-700) 50%, var(--blue-600) 100%)',
        padding: '80px 0 100px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{ position:'absolute', top:'-80px', right:'-80px', width:'400px', height:'400px', background:'rgba(255,255,255,0.04)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', bottom:'-100px', left:'-60px', width:'300px', height:'300px', background:'rgba(255,255,255,0.04)', borderRadius:'50%' }} />

        <div className="container" style={{ position:'relative', textAlign:'center' }}>
          <div className="fade-in-up">
            <span style={{ display:'inline-block', background:'rgba(255,255,255,0.15)', color:'#bfdbfe', padding:'6px 18px', borderRadius:'100px', fontSize:'13px', fontWeight:600, marginBottom:'20px', border:'1px solid rgba(255,255,255,0.2)' }}>
              📚 Your Learning Platform
            </span>
            <h1 style={{ fontSize:'clamp(2rem,5vw,3.5rem)', color:'white', marginBottom:'20px', lineHeight:1.15 }}>
              Learn Better.<br />
              <span style={{ color:'#93c5fd' }}>Study Smarter.</span>
            </h1>
            <p style={{ color:'#bfdbfe', fontSize:'1.1rem', maxWidth:'560px', margin:'0 auto 36px', lineHeight:1.7 }}>
              Access a curated library of study materials — PDFs, images, and video lessons — all in one place.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} style={{ display:'flex', gap:'0', maxWidth:'540px', margin:'0 auto', background:'white', borderRadius:'14px', padding:'6px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
              <FiSearch size={18} style={{ margin:'auto 12px', color:'var(--slate-400)', flexShrink:0 }} />
              <input
                type="text"
                placeholder="Search study materials..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex:1, border:'none', outline:'none', fontSize:'15px', color:'var(--slate-800)', background:'transparent' }}
              />
              <button type="submit" className="btn btn-primary" style={{ borderRadius:'10px' }}>
                Search
              </button>
            </form>
          </div>

          {/* Stats */}
          <div style={{ display:'flex', justifyContent:'center', gap:'48px', marginTop:'56px', flexWrap:'wrap' }}>
            {[
              { icon: FiBook, label: 'Study Materials', value: '500+' },
              { icon: FiUsers, label: 'Students', value: '2,000+' },
              { icon: FiAward, label: 'Subjects', value: '50+' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ textAlign:'center', color:'white' }}>
                <Icon size={24} style={{ color:'#93c5fd', margin:'0 auto 8px' }} />
                <div style={{ fontSize:'1.6rem', fontWeight:800, fontFamily:'var(--font-heading)' }}>{value}</div>
                <div style={{ fontSize:'13px', color:'#bfdbfe' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Materials Section ─────────────────────────────────── */}
      <section style={{ padding:'60px 0' }}>
        <div className="container">
          {/* Filters */}
          <div style={{ display:'flex', gap:'12px', marginBottom:'32px', flexWrap:'wrap', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'var(--slate-500)', fontSize:'14px', fontWeight:600 }}>
              <FiFilter size={15} /> Filter:
            </div>
            <select
              value={filter.category}
              onChange={e => { setFilter(f => ({...f, category: e.target.value})); setPage(1); }}
              style={{ padding:'8px 14px', borderRadius:'8px', border:'1.5px solid var(--slate-200)', fontSize:'14px', outline:'none', color:'var(--slate-700)', cursor:'pointer' }}
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filter.type}
              onChange={e => { setFilter(f => ({...f, type: e.target.value})); setPage(1); }}
              style={{ padding:'8px 14px', borderRadius:'8px', border:'1.5px solid var(--slate-200)', fontSize:'14px', outline:'none', color:'var(--slate-700)', cursor:'pointer' }}
            >
              <option value="">All Types</option>
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            {(filter.category || filter.type || search) && (
              <button
                onClick={() => { setFilter({ category:'', type:'' }); setSearch(''); setPage(1); }}
                className="btn btn-ghost btn-sm"
                style={{ color:'var(--danger)' }}
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : materials.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 20px' }}>
              <FiBook size={48} style={{ color:'var(--slate-300)', margin:'0 auto 16px' }} />
              <h3 style={{ color:'var(--slate-500)', marginBottom:'8px' }}>No materials found</h3>
              <p style={{ color:'var(--slate-400)', fontSize:'14px' }}>Try a different search or filter.</p>
            </div>
          ) : (
            <div className="grid-3">
              {materials.map(m => <MaterialCard key={m._id} material={m} />)}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{ display:'flex', justifyContent:'center', gap:'8px', marginTop:'40px' }}>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ minWidth:'40px', justifyContent:'center' }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA Banner ─────────────────────────────────────────── */}
      {!user?.isMember && (
        <section style={{ background:'var(--blue-50)', borderTop:'1px solid var(--blue-100)', padding:'60px 0' }}>
          <div className="container" style={{ textAlign:'center' }}>
            <h2 style={{ marginBottom:'12px' }}>Unlock Premium Study Materials</h2>
            <p style={{ color:'var(--slate-500)', marginBottom:'28px', maxWidth:'480px', margin:'0 auto 28px' }}>
              Get unlimited access to all premium content, download materials, and study without limits.
            </p>
            <Link to="/membership" className="btn btn-primary btn-lg">
              Become a Member <FiArrowRight />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
