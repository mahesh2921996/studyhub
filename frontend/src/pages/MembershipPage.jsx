import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiLock, FiDownload, FiVideo, FiFileText, FiStar } from 'react-icons/fi';
import { paymentService, settingsService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function MembershipPage() {
  const { user, isLoggedIn, isMember, updateUser } = useAuth();
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    paymentService.getConfig()
      .then(r => setConfig(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePayment = async () => {
    if (!isLoggedIn()) {
      toast.error('Please login first');
      return navigate('/login');
    }
    if (isMember()) {
      return toast.success('You already have an active membership!');
    }

    setPaying(true);
    try {
      const gateway = config?.activeGateway || 'razorpay';

      if (gateway === 'razorpay') {
        // ⚠️ RAZORPAY: Loads Razorpay script dynamically
        if (!window.Razorpay) {
          await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        }

        const orderRes = await paymentService.createOrder({ gateway: 'razorpay' });
        const { orderId, amount, currency, paymentDbId } = orderRes.data.data;

        const options = {
          key: config.razorpayKeyId, // ⚠️ From backend config (RAZORPAY_KEY_ID in .env)
          amount,
          currency,
          name: 'StudyHub',
          description: 'Membership Subscription',
          order_id: orderId,
          handler: async (response) => {
            try {
              await paymentService.verify({
                gateway: 'razorpay',
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                paymentDbId
              });
              updateUser({ isMember: true });
              toast.success('Membership activated! Welcome aboard 🎉');
              navigate('/');
            } catch {
              toast.error('Payment verification failed. Contact support.');
            }
          },
          prefill: { name: user?.name, email: user?.email },
          theme: { color: '#2563eb' }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else if (gateway === 'stripe') {
        // ⚠️ STRIPE: Requires @stripe/stripe-js package
        // npm install @stripe/stripe-js
        // import { loadStripe } from '@stripe/stripe-js';
        // const stripe = await loadStripe(config.stripePublishableKey);
        toast.info('Stripe integration: add @stripe/stripe-js and implement checkout flow here.');
      } else {
        toast.error('No payment gateway configured. Contact admin.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const loadScript = (src) => new Promise((res, rej) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = res;
    script.onerror = rej;
    document.head.appendChild(script);
  });

  const features = [
    { icon: FiFileText, text: 'Unlimited PDF access & viewing' },
    { icon: FiVideo, text: 'Stream all video lessons' },
    { icon: FiDownload, text: 'Download all materials' },
    { icon: FiStar, text: 'Priority support' },
    { icon: FiLock, text: 'Exclusive premium content' },
    { icon: FiCheck, text: 'No ads, no distractions' },
  ];

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, var(--blue-900), var(--blue-700))', padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ color: 'white', fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: '16px' }}>Unlock Full Access</h1>
          <p style={{ color: '#bfdbfe', maxWidth: '480px', margin: '0 auto', fontSize: '1.05rem' }}>
            One membership. Every material. Learn without limits.
          </p>
        </div>
      </section>

      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
          {isMember() ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'var(--blue-50)', borderRadius: 'var(--radius-xl)', border: '2px solid var(--blue-200)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌟</div>
              <h2 style={{ color: 'var(--blue-800)', marginBottom: '12px' }}>You're a Member!</h2>
              <p style={{ color: 'var(--blue-600)' }}>You have full access to all study materials.</p>
              {user?.membershipExpiry && (
                <p style={{ color: 'var(--slate-500)', fontSize: '14px', marginTop: '8px' }}>
                  Valid until: {new Date(user.membershipExpiry).toLocaleDateString('en-IN')}
                </p>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
              {/* Features */}
              <div>
                <h2 style={{ marginBottom: '24px' }}>What You Get</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {features.map(({ icon: Icon, text }) => (
                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: 36, height: 36, background: 'var(--blue-100)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={16} style={{ color: 'var(--blue-600)' }} />
                      </div>
                      <span style={{ fontSize: '15px', color: 'var(--slate-700)' }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Card */}
              <div className="card" style={{ padding: '36px', textAlign: 'center', border: '2px solid var(--blue-200)', boxShadow: 'var(--shadow-blue)' }}>
                <div style={{ display: 'inline-block', background: 'var(--blue-600)', color: 'white', padding: '4px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: 700, marginBottom: '20px' }}>
                  MOST POPULAR
                </div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Annual Membership</h3>
                {loading ? (
                  <div className="spinner" style={{ margin: '20px auto' }} />
                ) : (
                  <>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--blue-700)', fontFamily: 'var(--font-heading)', lineHeight: 1.1, marginBottom: '4px' }}>
                      ₹{config?.membershipFee || 499}
                    </div>
                    <p style={{ color: 'var(--slate-400)', fontSize: '13px', marginBottom: '28px' }}>
                      per {config?.membershipDuration === 0 ? 'lifetime' : 'year'}
                    </p>
                  </>
                )}
                <button
                  onClick={handlePayment}
                  disabled={paying || loading}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {paying ? 'Processing…' : isLoggedIn() ? 'Get Membership' : 'Login to Purchase'}
                </button>
                <p style={{ fontSize: '12px', color: 'var(--slate-400)', marginTop: '14px' }}>
                  Secure payment via {config?.activeGateway === 'stripe' ? 'Stripe' : 'Razorpay'}
                </p>

                {/* Gateway note for dev */}
                {!config?.razorpayKeyId && !config?.stripePublishableKey && (
                  <div style={{ marginTop: '14px', padding: '10px', background: '#fef3c7', borderRadius: '8px', fontSize: '12px', color: '#92400e' }}>
                    ⚠️ Payment gateway not configured yet. Add API keys in .env and Admin Settings.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
