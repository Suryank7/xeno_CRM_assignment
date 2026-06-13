import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ShieldCheck, ArrowRight, CreditCard } from 'lucide-react';

export default function Payment() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handlePay = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }, 1500);
  };

  if (success) {
    return (
      <div className="page-fade-in" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', color: '#111827', flexDirection: 'column' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, animation: 'scaleIn 0.5s ease-out' }}>
          <Check size={40} color="white" />
        </div>
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Payment Successful!</h2>
        <p style={{ color: '#6B7280' }}>Redirecting you to your new AI workspace...</p>
      </div>
    );
  }

  return (
    <div className="page-fade-in" style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#F9FAFB',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%', padding: '60px 24px', display: 'flex', gap: 40, alignItems: 'center' }}>
        
        {/* Left Side: Order Summary */}
        <div style={{ flex: 1, color: '#111827' }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 24, letterSpacing: '-1px' }}>Complete your upgrade</h1>
          <p style={{ color: '#4B5563', fontSize: 18, marginBottom: 40, lineHeight: 1.6 }}>
            You're one step away from unlocking the full power of Xeno Pulse AI.
          </p>

          <div style={{ background: '#fff', padding: 32, borderRadius: 24, border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 24, fontWeight: 700, color: '#7C3AED' }}>Pro Plan</h3>
                <p style={{ color: '#6B7280', marginTop: 4, fontWeight: 500 }}>Billed Annually</p>
              </div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>₹9,990<span style={{ fontSize: 16, color: '#9CA3AF', fontWeight: 500 }}>/yr</span></div>
            </div>

            <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {['Unlimited AI Campaigns', 'Predictive Campaign Simulator', 'Dedicated Customer Success Manager', 'API Access'].map((feature, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ background: '#F3F4F6', padding: 6, borderRadius: '50%' }}>
                    <Check size={16} color="#7C3AED" strokeWidth={3} />
                  </div>
                  <span style={{ color: '#374151', fontWeight: 500 }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Checkout Form */}
        <div style={{ width: 440 }}>
          <form onSubmit={handlePay} style={{ background: 'white', padding: 40, borderRadius: 24, border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, color: '#111827' }}>
              <CreditCard size={24} color="#7C3AED" /> Payment Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#4B5563' }}>Cardholder Name</label>
                <input required type="text" placeholder="John Doe" style={{
                  width: '100%', padding: '14px 16px', borderRadius: 12,
                  border: '1px solid #D1D5DB', outline: 'none', background: '#F9FAFB',
                  color: '#111827', fontWeight: 500
                }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#4B5563' }}>Card Number</label>
                <input required type="text" placeholder="0000 0000 0000 0000" maxLength={19} style={{
                  width: '100%', padding: '14px 16px', borderRadius: 12,
                  border: '1px solid #D1D5DB', outline: 'none', background: '#F9FAFB',
                  color: '#111827', fontWeight: 500
                }} />
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#4B5563' }}>Expiry Date</label>
                  <input required type="text" placeholder="MM/YY" maxLength={5} style={{
                    width: '100%', padding: '14px 16px', borderRadius: 12,
                    border: '1px solid #D1D5DB', outline: 'none', background: '#F9FAFB',
                    color: '#111827', fontWeight: 500
                  }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#4B5563' }}>CVC</label>
                  <input required type="text" placeholder="123" maxLength={4} style={{
                    width: '100%', padding: '14px 16px', borderRadius: 12,
                    border: '1px solid #D1D5DB', outline: 'none', background: '#F9FAFB',
                    color: '#111827', fontWeight: 500
                  }} />
                </div>
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: 16, borderRadius: 12, background: '#7C3AED',
                color: 'white', fontWeight: 600, fontSize: 16, border: 'none', cursor: 'pointer',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
                marginTop: 12, opacity: loading ? 0.7 : 1, transition: '0.2s',
                boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.4)'
              }}>
                {loading ? 'Processing...' : 'Pay ₹9,990'}
                {!loading && <ArrowRight size={18} />}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#9CA3AF', fontSize: 13, marginTop: 8, fontWeight: 500 }}>
                <ShieldCheck size={16} /> Payments are secure and encrypted
              </div>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
