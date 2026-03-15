import React, { useState } from 'react';
import { FiMail, FiUser, FiMessageSquare, FiSend } from 'react-icons/fi';
import { contactService } from '../services/api';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await contactService.send(form);
      toast.success('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, var(--blue-900), var(--blue-700))', padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ color: 'white', fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: '16px' }}>Contact Us</h1>
          <p style={{ color: '#bfdbfe', maxWidth: '480px', margin: '0 auto', fontSize: '1.05rem' }}>
            Have questions or feedback? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', maxWidth: '900px', margin: '0 auto' }}>
          {/* Info */}
          <div>
            <h2 style={{ marginBottom: '16px' }}>Get in Touch</h2>
            <p style={{ color: 'var(--slate-500)', lineHeight: 1.7, marginBottom: '32px' }}>
              Whether you have a question about our materials, need technical support, or want to contribute content — we're here to help.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: 42, height: 42, background: 'var(--blue-100)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FiMail size={18} style={{ color: 'var(--blue-600)' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', marginBottom: '4px' }}>Email</h4>
                  <a href="mailto:mbd2921996@gmail.com" style={{ color: 'var(--blue-600)', fontSize: '14px' }}>mbd2921996@gmail.com</a>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '24px' }}>Send a Message</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Your Name</label>
                <input type="text" placeholder="Full name" value={form.name}
                  onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea placeholder="Write your message here..." value={form.message}
                  onChange={e => setForm(f => ({...f, message: e.target.value}))} required rows={5} />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                <FiSend size={15} /> {loading ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
