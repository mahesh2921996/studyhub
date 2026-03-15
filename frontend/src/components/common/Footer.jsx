import React from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiMail, FiHeart } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--slate-900)',
      color: 'var(--slate-400)',
      padding: '48px 0 24px',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ background: 'var(--blue-600)', padding: '8px', borderRadius: '8px', color: 'white' }}>
                <FiBook size={18} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '18px', color: 'white' }}>
                Study<span style={{ color: 'var(--blue-400)' }}>Hub</span>
              </span>
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.7' }}>
              Providing affordable and accessible study materials to students everywhere.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'white', fontFamily: 'var(--font-heading)', marginBottom: '14px', fontSize: '15px' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[['/', 'Home'], ['/about', 'About Us'], ['/membership', 'Membership'], ['/contact', 'Contact']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} style={{ fontSize: '14px', color: 'var(--slate-400)', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = 'var(--blue-400)'}
                    onMouseLeave={e => e.target.style.color = 'var(--slate-400)'}
                  >{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: 'white', fontFamily: 'var(--font-heading)', marginBottom: '14px', fontSize: '15px' }}>Contact</h4>
            <a href="mailto:mbd2921996@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--slate-400)' }}>
              <FiMail size={14} /> mbd2921996@gmail.com
            </a>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--slate-800)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '13px' }}>© {new Date().getFullYear()} StudyHub. All rights reserved.</p>
          <p style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Made with <FiHeart size={12} style={{ color: 'var(--blue-400)' }} /> for students
          </p>
        </div>
      </div>
    </footer>
  );
}
