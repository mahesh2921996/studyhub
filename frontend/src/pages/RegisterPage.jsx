import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBook } from 'react-icons/fi';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await authService.register({ name: form.name, email: form.email, password: form.password });
      login(res.data.token, res.data.user);
      toast.success('Account created! Welcome to StudyHub 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--blue-50), white)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: 56, height: 56, background: 'var(--blue-600)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <FiBook size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Create Account</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '14px' }}>Join StudyHub and start learning today</p>
        </div>

        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Your name" value={form.name}
                onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Min. 6 characters" value={form.password}
                onChange={e => setForm(f => ({...f, password: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" placeholder="Repeat password" value={form.confirm}
                onChange={e => setForm(f => ({...f, confirm: e.target.value}))} required />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--slate-500)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--blue-600)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
