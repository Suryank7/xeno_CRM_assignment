import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Check } from 'lucide-react';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
  };

  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: 12, background: '#F9FAFB', border: '1px solid #D1D5DB', color: '#111827', outline: 'none', fontWeight: 500 };

  return (
    <div className="page-fade-in" style={{
      minHeight: '100vh',
      background: '#fff',
      fontFamily: "'Inter', sans-serif",
      color: '#111827',
      padding: '80px 24px'
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 16, letterSpacing: '-1px' }}>Get in touch</h1>
          <p style={{ color: '#6B7280', fontSize: 18, maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
            Whether you have a question about features, trials, pricing, or anything else, our team is ready to answer all your questions.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60 }}>
          {/* Left: Contact Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            <div>
              <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Contact Information</h3>
              
              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={24} color="#7C3AED" />
                </div>
                <div>
                  <div style={{ color: '#6B7280', fontSize: 13, marginBottom: 4, fontWeight: 500 }}>Email Us</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>hello@getxeno.com</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={24} color="#7C3AED" />
                </div>
                <div>
                  <div style={{ color: '#6B7280', fontSize: 13, marginBottom: 4, fontWeight: 500 }}>Call Us</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>+91 98765 43210</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={24} color="#7C3AED" />
                </div>
                <div>
                  <div style={{ color: '#6B7280', fontSize: 13, marginBottom: 4, fontWeight: 500 }}>Visit Us</div>
                  <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.5 }}>
                    Xeno AI HQ<br/>
                    123 Innovation Drive,<br/>
                    Bengaluru, Karnataka 560001
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: '#F9FAFB', padding: 32, borderRadius: 24, border: '1px solid #E5E7EB' }}>
              <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Looking for Support?</h4>
              <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
                If you are an existing customer needing technical assistance, please visit our help center.
              </p>
              <button style={{ background: 'transparent', border: '1px solid #7C3AED', color: '#7C3AED', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                Visit Help Center
              </button>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div>
            {success ? (
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: 40, borderRadius: 24, textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <Check size={32} color="white" />
                </div>
                <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Message Sent!</h3>
                <p style={{ color: '#065F46', lineHeight: 1.6 }}>
                  Thank you for reaching out to Xeno. One of our growth experts will get back to you within 24 hours.
                </p>
                <button onClick={() => setSuccess(false)} style={{ background: 'transparent', border: 'none', color: '#10B981', marginTop: 20, cursor: 'pointer', fontWeight: 600 }}>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 40, borderRadius: 24, border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, marginBottom: 8, fontWeight: 600, color: '#374151' }}>First Name</label>
                    <input required type="text" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, marginBottom: 8, fontWeight: 600, color: '#374151' }}>Last Name</label>
                    <input required type="text" style={inputStyle} />
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 8, fontWeight: 600, color: '#374151' }}>Work Email</label>
                  <input required type="email" style={inputStyle} />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, marginBottom: 8, fontWeight: 600, color: '#374151' }}>How can we help?</label>
                  <textarea required rows={5} style={{ ...inputStyle, resize: 'vertical' }}></textarea>
                </div>

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: 16, borderRadius: 12, background: '#7C3AED',
                  color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
                  opacity: loading ? 0.7 : 1, transition: '0.2s', boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.4)'
                }}>
                  {loading ? 'Sending...' : 'Send Message'}
                  {!loading && <Send size={18} />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
