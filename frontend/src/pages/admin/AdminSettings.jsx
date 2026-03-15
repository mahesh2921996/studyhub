import React, { useState, useEffect } from 'react';
import { FiSave, FiDollarSign, FiMail, FiCreditCard } from 'react-icons/fi';
import { settingsService } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsService.getAll()
      .then(r => setSettings(r.data.data))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (group) => {
    setSaving(true);
    try {
      await settingsService.update(settings);
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, settingKey, type = 'text', note }) => (
    <div className="form-group">
      <label>{label}</label>
      <input
        type={type}
        value={settings[settingKey] || ''}
        onChange={e => setSettings(s => ({...s, [settingKey]: type === 'number' ? Number(e.target.value) : e.target.value}))}
        placeholder={note}
      />
      {note && <p style={{ fontSize: '12px', color: 'var(--slate-400)', marginTop: '4px' }}>{note}</p>}
    </div>
  );

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Settings</h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '14px' }}>Configure your StudyHub platform</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* General */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: 36, height: 36, background: 'var(--blue-100)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiMail size={16} style={{ color: 'var(--blue-600)' }} />
            </div>
            <h3 style={{ fontSize: '16px' }}>General</h3>
          </div>
          <Field label="Site Name" settingKey="site_name" />
          <Field label="Tagline" settingKey="site_tagline" />
        </div>

        {/* Membership */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ width: 36, height: 36, background: '#d1fae5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiDollarSign size={16} style={{ color: '#059669' }} />
            </div>
            <h3 style={{ fontSize: '16px' }}>Membership Pricing</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <div className="form-group">
              <label>Membership Fee</label>
              <input type="number" min="0" value={settings.membership_fee || 499}
                onChange={e => setSettings(s => ({...s, membership_fee: Number(e.target.value)}))} />
            </div>
            <div className="form-group">
              <label>Currency</label>
              <select value={settings.membership_currency || 'INR'}
                onChange={e => setSettings(s => ({...s, membership_currency: e.target.value}))}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Duration (days)</label>
              <input type="number" min="0" value={settings.membership_duration || 365}
                onChange={e => setSettings(s => ({...s, membership_duration: Number(e.target.value)}))} />
              <p style={{ fontSize: '12px', color: 'var(--slate-400)', marginTop: '4px' }}>Set 0 for lifetime access</p>
            </div>
          </div>
        </div>

        {/* Payment Gateway */}
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: 36, height: 36, background: '#fef3c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiCreditCard size={16} style={{ color: '#d97706' }} />
            </div>
            <h3 style={{ fontSize: '16px' }}>Payment Gateway</h3>
          </div>

          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#92400e', marginBottom: '20px' }}>
            ⚠️ <strong>Important:</strong> API keys must be set in the <code>.env</code> file on the server, not here. This panel only sets which gateway is active.
          </div>

          <div className="form-group">
            <label>Active Payment Gateway</label>
            <select value={settings.payment_gateway || 'razorpay'}
              onChange={e => setSettings(s => ({...s, payment_gateway: e.target.value}))}>
              <option value="razorpay">Razorpay (Recommended for India)</option>
              <option value="stripe">Stripe (International)</option>
            </select>
          </div>

          <div style={{ background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: '8px', padding: '16px', fontSize: '13px' }}>
            <p style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--slate-700)' }}>To configure payment keys:</p>
            <ol style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--slate-600)' }}>
              <li>Open <code>backend/.env</code></li>
              <li>Set <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> for Razorpay</li>
              <li>Set <code>STRIPE_SECRET_KEY</code> and <code>STRIPE_PUBLISHABLE_KEY</code> for Stripe</li>
              <li>Restart the backend server</li>
            </ol>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '12px 32px' }}>
          <FiSave size={15} /> {saving ? 'Saving…' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}
