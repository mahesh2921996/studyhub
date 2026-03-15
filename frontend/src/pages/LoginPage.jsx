import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiBook } from 'react-icons/fi';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.login(form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate(res.data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--blue-50), white)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: 56, height: 56, background: 'var(--blue-600)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <FiBook size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Welcome Back</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '14px' }}>Sign in to your StudyHub account</p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm(f => ({...f, password: e.target.value}))} required />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '12px' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ fontSize: '14px', color: 'var(--slate-500)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--blue-600)', fontWeight: 600 }}>Register here</Link>
            </p>
          </div>
        </div>

        {/* Demo credentials hint */}
        <div style={{ marginTop: '16px', padding: '14px', background: 'var(--blue-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--blue-200)', fontSize: '13px', color: 'var(--blue-700)' }}>
          <strong>Admin demo:</strong> admin@studyhub.com / Admin@123456
        </div>
      </div>
    </div>
  );
}
