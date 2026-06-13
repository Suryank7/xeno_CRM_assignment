import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── tiny SVG helpers ─────────────────────────────────── */
const Star4 = ({ size = 24, color = '#7C3AED', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" fill={color} />
  </svg>
);

const Star4Small = ({ size = 16, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
    <path d="M12 2L13.8 10.2L22 12L13.8 13.8L12 22L10.2 13.8L2 12L10.2 10.2L12 2Z"
      stroke="#1e1b4b" strokeWidth="1.5" fill="none" />
  </svg>
);

export default function Landing() {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token') !== null;
  const handleAuthRedirect = () => navigate(isAuthenticated ? '/dashboard' : '/login');
  
  const [openFaq, setOpenFaq] = useState(0);
  const [billingYearly, setBillingYearly] = useState(true);
  
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const testimonials = [
    { text: "I've had the pleasure of working with Xeno Pulse for the past year, and I can confidently say that they have been instrumental in the success of our marketing initiatives. As a D2C brand, we needed a platform that could not only segment our audience but also grow with us as we scale. Xeno Pulse has exceeded our expectations on every front.", name: "Alex Fernandes", role: "CMO, RetailBrand" },
    { text: "The autonomous capabilities of Xeno Pulse are simply unmatched. Our retention campaigns are now running on autopilot, finding the right customers before they churn. It's like having an entire data science team working around the clock.", name: "Sarah Jenkins", role: "Head of Growth, TrendSet" },
    { text: "Since migrating to Xeno Pulse, our ROAS has jumped by 32%. The AI actually learns which messages work best on which channels. We no longer guess where to spend our marketing budget—the system decides and executes flawlessly.", name: "David Chen", role: "E-commerce Director, Aura" },
    { text: "Implementation took just two days. The moment we uploaded our CSV, the AI identified over 10,000 hidden opportunities in our dormant user base. The resulting campaign was our highest grossing this quarter.", name: "Priya Sharma", role: "Founder, LuxeLife" },
    { text: "We used to spend hours manually creating segments and setting up multi-channel drips. Now we just define the goal, and Xeno Pulse's agents handle everything from targeting to delivery. A true game-changer.", name: "Michael Ross", role: "VP Marketing, TechGear" }
  ];

  const handleNextTestimonial = () => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  const handlePrevTestimonial = () => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const handleSubscribe = () => {
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  /* animated counters */
  const [counts, setCounts] = useState({ a: 0, b: 0, c: 0, d: 0 });
  const statsRef = useRef(null);
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        animateCount('a', 76);
        animateCount('b', 62);
        animateCount('c', 100);
        animateCount('d', 59);
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function animateCount(key, target) {
    let cur = 0;
    const step = Math.ceil(target / 40);
    const iv = setInterval(() => {
      cur += step;
      if (cur >= target) { cur = target; clearInterval(iv); }
      setCounts(p => ({ ...p, [key]: cur }));
    }, 30);
  }

  const faqs = [
    { q: 'How does the AI decide which customers to target?', a: 'Our multi-agent system analyzes purchase history, recency, frequency, and monetary value to automatically identify high-potential segments — from churning VIPs to dormant buyers ready for a win-back.' },
    { q: 'Can I use my own customer data?', a: 'Absolutely. Upload a simple CSV of your customers and orders, and the AI instantly begins profiling, segmenting, and recommending campaigns.' },
    { q: 'What channels are supported?', a: 'Currently WhatsApp, SMS, and Email via our simulated delivery pipeline. The system tracks Sent → Delivered → Opened → Clicked → Purchased for each message.' },
    { q: 'Is it really autonomous?', a: 'Yes. The AI Growth Agent can scan for opportunities, create campaigns, pick the best channel per customer, send messages, and then learn from results — all without manual intervention.' },
  ];

  return (
    <div className="lp">
      {/* ─── NAVBAR ─── */}
      <nav className="lp-nav">
        <div className="lp-wrap lp-nav-inner">
          <div className="lp-logo">
            <div className="lp-logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#fff"/>
              </svg>
            </div>
            <span>Xeno <b>Pulse</b></span>
          </div>

          <ul className="lp-links">
            <li><a href="#how">How It Works</a></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#testimonials">Testimonials</a></li>
            <li><a href="#pricing">Pricing</a></li>
          </ul>

          <div className="lp-nav-cta">
            <button className="lp-btn lp-btn-ghost" onClick={handleAuthRedirect}>{isAuthenticated ? 'Dashboard' : 'Log In'}</button>
            {!isAuthenticated && <button className="lp-btn lp-btn-primary" onClick={handleAuthRedirect}>Sign Up</button>}
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="lp-hero">
        <Star4 size={28} color="#7C3AED" style={{ position: 'absolute', top: 100, left: 80 }} />
        <Star4Small size={20} style={{ position: 'absolute', top: 90, right: 120 }} />
        <Star4Small size={14} style={{ position: 'absolute', bottom: 100, left: 220 }} />

        <div className="lp-wrap lp-hero-grid">
          {/* LEFT */}
          <div className="lp-hero-text">
            <span className="lp-pill"># AI-NATIVE CRM PLATFORM</span>
            <h1>Make The Best<br/>Marketing Decisions</h1>
            <p>
              Xeno Pulse is an autonomous shopper growth engine that analyzes your customer data,
              discovers high-value segments, and runs personalized campaigns — all powered by AI.
            </p>
            <div className="lp-hero-btns">
              <button className="lp-btn lp-btn-primary lp-btn-lg" onClick={handleAuthRedirect}>
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started Now'}
              </button>
              <button className="lp-btn lp-btn-outline lp-btn-lg" onClick={() => navigate('/contact')}>
                Contact Us
              </button>
            </div>
          </div>

          {/* RIGHT – phone mockups */}
          <div className="lp-hero-phones">
            {/* decorative circles */}
            <div className="lp-circle lp-circle-1"></div>
            <div className="lp-circle lp-circle-2"></div>

            {/* Phone 1 (front-left) */}
            <div className="lp-phone lp-phone-front">
              <div className="lp-phone-notch"></div>
              <div className="lp-phone-screen">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Welcome back</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Hello Admin</div>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>XP</div>
                </div>

                <div className="lp-phone-card" style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>TOTAL REVENUE</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '6px 0' }}>₹4,28,970</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#a5f3fc', fontWeight: 600 }}>↑ 24.5%</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>vs last month</span>
                  </div>
                </div>

                <div className="lp-phone-card" style={{ background: '#1e1b4b' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Active Campaign</div>
                    <span style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(124,58,237,0.3)', color: '#c4b5fd', borderRadius: 8, fontWeight: 600 }}>LIVE</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Summer VIP Win-back</div>
                  <div style={{ width: '100%', height: 5, background: '#312e81', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: '72%', height: '100%', background: 'linear-gradient(90deg,#7C3AED,#a78bfa)', borderRadius: 3 }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>1,204 sent</span>
                    <span style={{ fontSize: 10, color: '#a78bfa', fontWeight: 600 }}>72% delivered</span>
                  </div>
                </div>

                <div className="lp-phone-card" style={{ background: '#1e1b4b', marginTop: 12 }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>Conversion Trend</div>
                  <svg viewBox="0 0 200 50" style={{ width: '100%', height: 40 }}>
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#7C3AED" />
                        <stop offset="100%" stopColor="#a78bfa" />
                      </linearGradient>
                    </defs>
                    <path d="M0,35 C30,30 50,10 80,25 C110,40 130,15 160,20 C180,23 195,8 200,12"
                      fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="160" cy="20" r="4" fill="#7C3AED" stroke="#fff" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Phone 2 (back-right) */}
            <div className="lp-phone lp-phone-back">
              <div className="lp-phone-notch"></div>
              <div className="lp-phone-screen">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Segments</div>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#312e81', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </div>
                </div>

                <div className="lp-phone-card" style={{ background: '#7C3AED', marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>HIGH VALUE</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>1,204 users</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Spent &gt; ₹5,000</div>
                </div>

                <div className="lp-phone-card" style={{ background: '#1e1b4b', marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>AT RISK</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>342 users</div>
                  <div style={{ fontSize: 10, color: '#f87171' }}>No purchase 90d+</div>
                </div>

                <div className="lp-phone-card" style={{ background: '#1e1b4b' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>NEW BUYERS</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>89 users</div>
                  <div style={{ fontSize: 10, color: '#34d399' }}>First purchase &lt; 7d</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUSTED LOGOS ─── */}
      <section className="lp-logos">
        <div className="lp-wrap" style={{ textAlign: 'center' }}>
          <h3 className="lp-logos-title">Trusted By Millions Of Customers.</h3>
          <div className="lp-logos-row">
            <span style={{ fontFamily: 'Georgia, serif', fontWeight: 800 }}>MakeLess</span>
            <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>🌿 coworks</span>
            <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>🌱 greener</span>
            <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: 1 }}>◉ SAAS TODAY</span>
            <span style={{ fontFamily: 'Georgia, serif', fontWeight: 800 }}>Dorfus</span>
            <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontWeight: 700 }}>askimat</span>
          </div>
          <div className="lp-divider"></div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how" className="lp-how">
        <div className="lp-wrap" style={{ textAlign: 'center' }}>
          <span className="lp-pill lp-pill-sm">How It Works</span>
          <h2 className="lp-heading">Let AI Manage Your<br/>Campaigns For You!</h2>

          <div className="lp-steps">
            {/* connector line */}
            <div className="lp-steps-line"></div>

            <div className="lp-step">
              <span className="lp-step-tag">STEP – 01</span>
              <div className="lp-step-dot"></div>
              <h4>Upload Data</h4>
              <p>Upload your customer & order data as a simple CSV file. Our system ingests it instantly.</p>
              <div className="lp-step-illustration">
                <div className="lp-ill-phone">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </div>
              </div>
            </div>

            <div className="lp-step lp-step-offset">
              <div className="lp-step-illustration">
                <div className="lp-ill-phone" style={{ borderColor: '#f59e0b' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                </div>
              </div>
              <div className="lp-step-dot" style={{ marginTop: 24 }}></div>
              <span className="lp-step-tag">STEP – 02</span>
              <h4>AI Discovers Segments</h4>
              <p>Our multi-agent AI analyzes behavior to find your highest-value audiences automatically.</p>
            </div>

            <div className="lp-step">
              <span className="lp-step-tag">STEP – 03</span>
              <div className="lp-step-dot"></div>
              <h4>Launch & Learn</h4>
              <p>AI creates campaigns, sends messages, tracks results, and self-optimizes for the next run.</p>
              <div className="lp-step-illustration">
                <div className="lp-ill-phone" style={{ borderColor: '#10b981' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SPLIT 1: Analytics ─── */}
      <section className="lp-split">
        <div className="lp-wrap lp-split-grid">
          <div className="lp-split-visual">
            <Star4 size={18} color="#7C3AED" style={{ position: 'absolute', top: -20, left: -10 }} />
            <Star4Small size={14} style={{ position: 'absolute', bottom: 40, right: -20 }} />

            <div className="lp-analytics-card">
              <div className="lp-phone" style={{ position: 'relative', width: 220, height: 440, margin: '0 auto', transform: 'none' }}>
                <div className="lp-phone-notch"></div>
                <div className="lp-phone-screen" style={{ padding: '20px 14px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Campaign Status</div>
                  {/* donut chart */}
                  <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 16px' }}>
                    <svg viewBox="0 0 120 120" width="120" height="120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#312e81" strokeWidth="12" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#7C3AED" strokeWidth="12"
                        strokeDasharray="204 314" strokeDashoffset="-78" strokeLinecap="round"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#10b981" strokeWidth="12"
                        strokeDasharray="110 314" strokeDashoffset="0"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>65%</span>
                      <span style={{ fontSize: 9, color: '#94a3b8' }}>Complete</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12, fontSize: 10, marginBottom: 16 }}>
                    <span style={{ color: '#94a3b8' }}>● <span style={{ color: '#10b981' }}>Delivered</span></span>
                    <span style={{ color: '#94a3b8' }}>● <span style={{ color: '#7C3AED' }}>Opened</span></span>
                    <span style={{ color: '#94a3b8' }}>● <span style={{ color: '#312e81' }}>Pending</span></span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Monthly</div>
                  <div className="lp-phone-card" style={{ background: '#312e81', padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>
                      <span>Completed</span><span style={{ color: '#10b981', fontWeight: 700 }}>65%</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: '#1e1b4b', borderRadius: 3 }}>
                      <div style={{ width: '65%', height: '100%', background: 'linear-gradient(90deg,#10b981,#34d399)', borderRadius: 3 }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginTop: 8 }}>
                      <span>In Progress</span><span style={{ color: '#f59e0b', fontWeight: 700 }}>25%</span>
                    </div>
                    <div style={{ width: '100%', height: 6, background: '#1e1b4b', borderRadius: 3, marginTop: 4 }}>
                      <div style={{ width: '25%', height: '100%', background: 'linear-gradient(90deg,#f59e0b,#fbbf24)', borderRadius: 3 }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* decorative curve */}
            <svg className="lp-curve" viewBox="0 0 120 60" width="120" height="60">
              <path d="M10,50 Q60,0 110,50" fill="none" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
              <polygon points="108,44 116,50 108,56" fill="#1e1b4b" />
            </svg>
          </div>

          <div className="lp-split-text">
            <span className="lp-pill lp-pill-sm">About Our Platform</span>
            <h2 className="lp-heading lp-heading-left">Predictive Analytics &<br/>Real-Time Reporting</h2>
            <p className="lp-desc">
              Track the exact impact of every campaign you send. Xeno Pulse predicts conversion
              rates, auto-segments audiences, and gives you a live view of delivery, open, and
              purchase metrics — all in one dashboard.
            </p>
            <ul className="lp-checklist">
              <li><span className="lp-check-dot orange"></span>Comprehensive marketing & analytics dashboard.</li>
              <li><span className="lp-check-dot green"></span>Trusted by data-driven D2C brands worldwide.</li>
              <li><span className="lp-check-dot purple"></span>Self-learning AI optimization loop.</li>
            </ul>
            <button className="lp-btn lp-btn-primary lp-btn-lg" style={{ marginTop: 32 }} onClick={handleAuthRedirect}>
              Discover More
            </button>
          </div>
        </div>
      </section>

      {/* ─── SPLIT 2: App Advantage ─── */}
      <section className="lp-split" style={{ paddingTop: 40 }}>
        <Star4 size={20} color="#ec4899" style={{ position: 'absolute', right: 80, top: 60 }} />
        <div className="lp-wrap lp-split-grid lp-split-reverse">
          <div className="lp-split-text">
            <span className="lp-pill lp-pill-sm">App Advantage</span>
            <h2 className="lp-heading lp-heading-left">Autonomous Multi-Channel<br/>Campaign Execution</h2>
            <p className="lp-desc">
              Reach every customer on the channel they prefer. The AI decides whether to send
              via WhatsApp, SMS, or Email based on each individual's behavior and engagement patterns.
            </p>
            <div className="lp-feature-2x2">
              <div><span className="lp-check-dot green"></span>Multi-Channel</div>
              <div><span className="lp-check-dot green"></span>Fully Responsive</div>
              <div><span className="lp-check-dot green"></span>Natural Language</div>
              <div><span className="lp-check-dot green"></span>Ultimate Support</div>
            </div>
            <button className="lp-btn lp-btn-primary lp-btn-lg" style={{ marginTop: 32 }} onClick={handleAuthRedirect}>
              Get Started
            </button>
          </div>

          <div className="lp-split-visual" style={{ position: 'relative' }}>
            <div className="lp-feature-photo-wrap">
              <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=440&h=540"
                alt="Xeno Pulse user" className="lp-feature-photo" loading="lazy" />
              {/* floating mini phone */}
              <div className="lp-mini-phone">
                <div style={{ padding: 14, background: '#0f0d2e', borderRadius: 16, color: '#fff' }}>
                  <div style={{ fontSize: 9, color: '#94a3b8', letterSpacing: 1 }}>MESSAGES SENT</div>
                  <div style={{ fontSize: 22, fontWeight: 800, margin: '4px 0' }}>₹2,00,000</div>
                  <div style={{ display: 'flex', gap: 6, fontSize: 9 }}>
                    <span style={{ background: '#312e81', padding: '2px 6px', borderRadius: 6, color: '#a78bfa' }}>WhatsApp</span>
                    <span style={{ background: '#312e81', padding: '2px 6px', borderRadius: 6, color: '#34d399' }}>Email</span>
                  </div>
                  <div style={{ marginTop: 10, borderTop: '1px solid #1e1b4b', paddingTop: 8 }}>
                    {[['Rahul K.', '-₹499', '#f87171'], ['Priya S.', '-₹1,200', '#f87171'], ['Amit M.', '+₹3,400', '#34d399']].map(([n, a, c], i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, padding: '3px 0', color: '#94a3b8' }}>
                        <span>{n}</span><span style={{ color: c, fontWeight: 600 }}>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BANNER ─── */}
      <section className="lp-stats" ref={statsRef}>
        <div className="lp-wrap lp-stats-grid">
          <div className="lp-stat"><h3>{counts.a}k+</h3><p>Customers analyzed<br/>every month</p></div>
          <div className="lp-stat"><h3>{counts.b}k+</h3><p>Total campaigns<br/>launched by AI</p></div>
          <div className="lp-stat"><h3>{counts.c}k</h3><p>Messages delivered<br/>successfully</p></div>
          <div className="lp-stat"><h3>{counts.d}k+</h3><p>Hours saved by<br/>our customers</p></div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section id="features" className="lp-features-section">
        <div className="lp-wrap" style={{ textAlign: 'center' }}>
          <span className="lp-pill lp-pill-sm">Our Features</span>
          <h2 className="lp-heading">The Most Intuitive Platform For<br/>Your Growth Needs</h2>

          <div className="lp-features-grid">
            <div className="lp-fbox lp-fbox-purple">
              <div className="lp-fbox-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h4>Powerful AI<br/>Reasoning</h4>
              <p>Understand exactly why the AI chose each audience segment or message variant.</p>
            </div>
            <div className="lp-fbox lp-fbox-yellow">
              <div className="lp-fbox-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <h4>Collaboration &<br/>Share Info</h4>
              <p>Work together with your team in real-time and share campaign insights instantly.</p>
            </div>
            <div className="lp-fbox lp-fbox-green">
              <div className="lp-fbox-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>
              </div>
              <h4>Easy Sort, Classify<br/>and Search</h4>
              <p>Find any customer or campaign in seconds with natural language search and filters.</p>
            </div>
            <div className="lp-fbox lp-fbox-pink">
              <div className="lp-fbox-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              </div>
              <h4>Share your Data to<br/>Anyone</h4>
              <p>Export segments and campaign results easily — CSV, JSON, or push to external tools.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="lp-faq">
        <div className="lp-wrap lp-faq-grid">
          <div className="lp-faq-left">
            <span className="lp-pill lp-pill-sm">FAQS</span>
            <h2 className="lp-heading lp-heading-left">Frequently Asked<br/>Questions</h2>
            <p className="lp-desc" style={{ marginBottom: 32 }}>
              Everything you need to know about how Xeno Pulse AI works and how it can help your brand grow.
            </p>
            <div className="lp-faq-list">
              {faqs.map((f, i) => (
                <div key={i} className={`lp-faq-item ${openFaq === i ? 'open' : ''}`} onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  <div className="lp-faq-q">
                    <span>{f.q}</span>
                    <span className="lp-faq-toggle">{openFaq === i ? '−' : '+'}</span>
                  </div>
                  <div className="lp-faq-a"><p>{f.a}</p></div>
                </div>
              ))}
            </div>
          </div>

          <div className="lp-faq-right">
            <Star4 size={22} color="#fff" style={{ position: 'absolute', top: 40, left: 40, opacity: 0.6 }} />
            <Star4Small size={16} style={{ position: 'absolute', bottom: 60, right: 40 }} />
            {/* decorative phone outlines */}
            <div className="lp-faq-phone-1">
              <div style={{ padding: 16 }}>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 14, marginBottom: 10, backdropFilter: 'blur(8px)' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>AI Growth Agent</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Find churning VIPs</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Response</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Found 42 VIP customers at risk of churning…</div>
                </div>
              </div>
            </div>
            <div className="lp-faq-phone-2">
              <div style={{ padding: 16 }}>
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>Campaign Sent</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>✓ 1,204</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" className="lp-testimonials">
        <div className="lp-wrap" style={{ textAlign: 'center' }}>
          <span className="lp-pill lp-pill-sm">Testimonials</span>
          <h2 className="lp-heading">What Our Clients Say?</h2>

          <div className="lp-testimonial-card" style={{ minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="lp-stars">{'★★★★★'}</div>
            <p className="lp-testimonial-text" style={{ minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              "{testimonials[currentTestimonial].text}"
            </p>
            <div className="lp-avatars-row">
              {testimonials.map((_, i) => (
                <img key={i} src={`https://i.pravatar.cc/60?u=user${i + 1}`} alt="" className={`lp-avatar-small ${currentTestimonial === i ? 'active' : ''}`} style={{ opacity: currentTestimonial === i ? 1 : 0.4, border: currentTestimonial === i ? '2px solid #7C3AED' : 'none', transition: '0.3s' }} loading="lazy" />
              ))}
            </div>
            <div className="lp-author-info">
              <h4>{testimonials[currentTestimonial].name}</h4>
              <span>{testimonials[currentTestimonial].role}</span>
            </div>
            <div className="lp-testimonial-nav">
              <button className="lp-tnav" onClick={handlePrevTestimonial}>←</button>
              <button className="lp-tnav" onClick={handleNextTestimonial}>→</button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="lp-pricing">
        <Star4 size={20} color="#ec4899" style={{ position: 'absolute', left: 80, top: 60 }} />
        <Star4 size={16} color="#f59e0b" style={{ position: 'absolute', right: 120, bottom: 200 }} />
        <div className="lp-wrap" style={{ textAlign: 'center' }}>
          <span className="lp-pill lp-pill-sm">Pricing Plan</span>
          <h2 className="lp-heading">Choose The Plan That Suits You!</h2>
          <p className="lp-desc" style={{ marginBottom: 24 }}>Choose a plan that suits your business needs</p>

          <div className="lp-billing-toggle">
            <span className={!billingYearly ? 'active' : ''}>Monthly</span>
            <button className={`lp-toggle ${billingYearly ? 'on' : ''}`} onClick={() => setBillingYearly(!billingYearly)}>
              <span className="lp-toggle-knob"></span>
            </button>
            <span className={billingYearly ? 'active' : ''}>Yearly <span className="lp-save">Save 35%</span></span>
          </div>

          <div className="lp-pricing-grid">
            <div className="lp-price-card">
              <h4>Standard</h4>
              <p className="lp-price-sub">Perfect plan to get started</p>
              <div className="lp-price-amount">${billingYearly ? '10.00' : '16.00'}</div>
              <ul className="lp-price-list">
                <li className="yes">Up to 5,000 customers</li>
                <li className="yes">Basic AI segments</li>
                <li className="yes">Email channel only</li>
                <li className="no">Autonomous execution</li>
                <li className="no">24/7 Customer support</li>
              </ul>
              <button className="lp-btn lp-btn-outline-purple lp-btn-full" onClick={() => navigate('/payment')}>Choose Your Plan</button>
            </div>

            <div className="lp-price-card lp-price-featured">
              <h4>Unlimited</h4>
              <p className="lp-price-sub">For the professionals</p>
              <div className="lp-price-amount">${billingYearly ? '64.00' : '99.00'}</div>
              <ul className="lp-price-list">
                <li className="yes">Unlimited customers</li>
                <li className="yes">Advanced Digital Twins</li>
                <li className="yes">Multi-channel (SMS, WA)</li>
                <li className="yes">Full Autonomous AI Loop</li>
                <li className="yes">24/7 Customer support</li>
              </ul>
              <button className="lp-btn lp-btn-dark lp-btn-full" onClick={() => navigate('/payment')}>Choose Your Plan</button>
            </div>

            <div className="lp-price-card">
              <h4>Premium</h4>
              <p className="lp-price-sub">For enterprise scale</p>
              <div className="lp-price-amount">${billingYearly ? '129.00' : '199.00'}</div>
              <ul className="lp-price-list">
                <li className="yes">Everything in Unlimited</li>
                <li className="yes">Custom Integrations</li>
                <li className="yes">Dedicated Manager</li>
                <li className="yes">SLA guarantee</li>
                <li className="yes">24/7 Priority support</li>
              </ul>
              <button className="lp-btn lp-btn-outline-purple lp-btn-full" onClick={() => navigate('/payment')}>Choose Your Plan</button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DOWNLOAD CTA ─── */}
      <section className="lp-download">
        <div className="lp-wrap lp-download-grid">
          <div className="lp-download-text">
            <span className="lp-pill lp-pill-sm">Download App</span>
            <h2 className="lp-heading lp-heading-left" style={{ marginBottom: 20 }}>Download Our App And<br/>Start Your Free Trial To<br/>Get Started Today!</h2>
            <p className="lp-desc" style={{ marginBottom: 32 }}>
              Assure users that your SaaS product is secure and compliant with
              industry standards and regulations.
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              <button className="lp-store-btn">
                <span style={{ fontSize: 18 }}>▶</span>
                <div><span style={{ fontSize: 9, opacity: 0.8 }}>GET IT ON</span><br/><b>Google Play</b></div>
              </button>
              <button className="lp-store-btn">
                <span style={{ fontSize: 18 }}></span>
                <div><span style={{ fontSize: 9, opacity: 0.8 }}>Download on the</span><br/><b>App Store</b></div>
              </button>
            </div>
          </div>
          <div className="lp-download-visual">
            <div className="lp-phone" style={{ position: 'relative', width: 200, height: 400, transform: 'rotate(5deg)' }}>
              <div className="lp-phone-notch"></div>
              <div className="lp-phone-screen" style={{ padding: '16px 12px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Dashboard</div>
                <div className="lp-phone-card" style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)' }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>REVENUE</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>₹5,00,432</div>
                </div>
                <div className="lp-phone-card" style={{ background: '#1e1b4b', marginTop: 8 }}>
                  <div style={{ fontSize: 9, color: '#94a3b8' }}>Growth</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#34d399' }}>+32.4%</div>
                </div>
              </div>
            </div>
            <div className="lp-phone" style={{ position: 'absolute', top: 40, right: 0, width: 200, height: 400, transform: 'rotate(-5deg)', zIndex: 2 }}>
              <div className="lp-phone-notch"></div>
              <div className="lp-phone-screen" style={{ padding: '16px 12px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 12 }}>AI Agent</div>
                <div className="lp-phone-card" style={{ background: '#312e81' }}>
                  <div style={{ fontSize: 9, color: '#94a3b8' }}>Command</div>
                  <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>Find inactive VIPs</div>
                </div>
                <div className="lp-phone-card" style={{ background: '#1e1b4b', marginTop: 8 }}>
                  <div style={{ fontSize: 9, color: '#94a3b8' }}>Result</div>
                  <div style={{ fontSize: 14, color: '#a78bfa', fontWeight: 700 }}>42 found</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>Campaign ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ─── */}
      <section className="lp-newsletter">
        <div className="lp-wrap lp-newsletter-inner">
          <Star4 size={20} color="#7C3AED" style={{ position: 'absolute', left: 40, top: '50%', transform: 'translateY(-50%)' }} />
          <div>
            <h3>Subscribe Our Newsletter</h3>
            <p>Get started for 1 Month free trial. No Purchase required.</p>
          </div>
          {subscribed ? (
            <div style={{ padding: '16px 24px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', borderRadius: 12, fontWeight: 600 }}>
              Thanks! You're subscribed to Xeno Pulse updates.
            </div>
          ) : (
            <div className="lp-nl-form">
              <div className="lp-nl-input">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <button className="lp-btn lp-btn-primary" onClick={handleSubscribe}>Subscribe Now</button>
            </div>
          )}
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-grid">
          <div className="lp-footer-brand">
            <div className="lp-logo" style={{ marginBottom: 16 }}>
              <div className="lp-logo-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#fff"/>
                </svg>
              </div>
              <span>Xeno <b>Pulse</b></span>
            </div>
            <p className="lp-footer-desc">
              AI-native CRM platform that autonomously analyzes customer data, discovers opportunities, and executes personalized campaigns at scale.
            </p>
            <div className="lp-social">
              {['f', 'in', '▶', '✉'].map((icon, i) => (
                <a key={i} href="#" className="lp-social-icon">{icon}</a>
              ))}
            </div>
          </div>

          <div className="lp-footer-col">
            <h5>Product</h5>
            <a href="https://www.getxeno.com/product" target="_blank" rel="noreferrer">Product Tour</a>
            <a href="https://www.getxeno.com/features" target="_blank" rel="noreferrer">Analytics</a>
            <a href="https://www.getxeno.com/about" target="_blank" rel="noreferrer">Product Overview</a>
            <a href="https://www.getxeno.com/blog" target="_blank" rel="noreferrer">What's New</a>
            <a href="https://www.getxeno.com/contact" target="_blank" rel="noreferrer">Templates</a>
          </div>
          <div className="lp-footer-col">
            <h5>Company</h5>
            <a href="https://www.getxeno.com/" target="_blank" rel="noreferrer">What we Offer</a>
            <a href="https://www.getxeno.com/about" target="_blank" rel="noreferrer">Our Story</a>
            <a href="https://www.getxeno.com/blog" target="_blank" rel="noreferrer">Latest Posts</a>
            <a href="https://www.getxeno.com/contact" target="_blank" rel="noreferrer">Help Center</a>
            <a href="https://www.getxeno.com/partners" target="_blank" rel="noreferrer">Our Partners</a>
          </div>
          <div className="lp-footer-col">
            <h5>Resources</h5>
            <a href="https://www.getxeno.com/blog" target="_blank" rel="noreferrer">Blog</a>
            <a href="#pricing">Pricing</a>
            <a href="#how">FAQ</a>
            <a href="https://www.getxeno.com/events" target="_blank" rel="noreferrer">Events</a>
            <a href="https://www.getxeno.com/ebooks" target="_blank" rel="noreferrer">Ebook & Guide</a>
          </div>
          <div className="lp-footer-col">
            <h5>Services</h5>
            <a href="https://www.getxeno.com/" target="_blank" rel="noreferrer">AI Campaign Manager</a>
            <a href="https://www.getxeno.com/" target="_blank" rel="noreferrer">Data Analytics</a>
            <a href="https://www.getxeno.com/" target="_blank" rel="noreferrer">Customer Intelligence</a>
            <a href="https://www.getxeno.com/" target="_blank" rel="noreferrer">Automation</a>
            <a href="https://www.getxeno.com/" target="_blank" rel="noreferrer">Integrations</a>
          </div>
        </div>

        <div className="lp-copyright">
          <div className="lp-wrap">
            Copyright © 2026 <a href="https://www.getxeno.com/" target="_blank" rel="noreferrer">Xeno Pulse</a>. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
