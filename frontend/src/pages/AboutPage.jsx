import React from 'react';
import { FiTarget, FiZap, FiUsers, FiBook } from 'react-icons/fi';

export default function AboutPage() {
  const values = [
    { icon: FiTarget, title: 'Our Vision', desc: 'Provide affordable and accessible study materials to students from all backgrounds, breaking down the barriers to quality education.' },
    { icon: FiZap, title: 'Our Mission', desc: 'Help students learn better through organized, searchable digital content — PDFs, images, and video lessons all in one place.' },
    { icon: FiUsers, title: 'Community', desc: 'Build a thriving community of learners who support each other and share knowledge freely.' },
    { icon: FiBook, title: 'Quality', desc: 'Every piece of content is carefully reviewed and organized to ensure students get the best learning experience.' },
  ];

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, var(--blue-900), var(--blue-700))', padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ color: 'white', fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: '16px' }}>About StudyHub</h1>
          <p style={{ color: '#bfdbfe', maxWidth: '560px', margin: '0 auto', fontSize: '1.1rem', lineHeight: 1.7 }}>
            We believe every student deserves access to high-quality study materials, regardless of their financial situation.
          </p>
        </div>
      </section>

      {/* Story */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '20px' }}>Our Story</h2>
            <p style={{ color: 'var(--slate-600)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '16px' }}>
              StudyHub was founded with a simple belief — quality education should be accessible to everyone. We noticed students spending too much time hunting for reliable study materials across the web, losing precious learning time.
            </p>
            <p style={{ color: 'var(--slate-600)', lineHeight: 1.8, fontSize: '1.05rem' }}>
              So we built a centralized platform where educators can share materials and students can learn effectively. With organized categories, in-browser viewers, and a supportive community, StudyHub is the learning companion every student deserves.
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid-4" style={{ marginTop: '64px' }}>
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card" style={{ padding: '28px 24px', textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, background: 'var(--blue-100)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Icon size={24} style={{ color: 'var(--blue-600)' }} />
                </div>
                <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>{title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--slate-500)', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
