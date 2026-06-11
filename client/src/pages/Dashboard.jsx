import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Megaphone, Layers, TrendingUp, TrendingDown,
  Sparkles, ArrowRight, Zap, Target,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { getCustomerStats, getCampaigns, getSegments, getOpportunities } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({});
  const [campaigns, setCampaigns] = useState([]);
  const [segments, setSegments] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [statsRes, campRes, segRes, oppRes] = await Promise.all([
        getCustomerStats(),
        getCampaigns(),
        getSegments(),
        getOpportunities().catch(() => ({ data: { data: [] } })),
      ]);
      setStats(statsRes.data.data);
      setCampaigns(campRes.data.data.slice(0, 5));
      setSegments(segRes.data.data.slice(0, 5));
      setOpportunities(oppRes.data.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  return (
    <>
      <Header title="Dashboard" subtitle="Xeno Pulse AI — Autonomous Growth Engine" />

      <div className="app-content">
        {/* Placeholder banner — user will replace with custom home design */}
        <div className="card animate-slide-up" style={{
          padding: 32,
          background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
          color: 'white',
          marginBottom: 24,
          textAlign: 'center',
        }}>
          <Sparkles size={32} style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Welcome to Xeno Pulse AI</h2>
          <p style={{ opacity: 0.9, marginBottom: 20, maxWidth: 500, margin: '0 auto 20px' }}>
            Your autonomous shopper growth engine. Custom home page design coming soon.
          </p>
          <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(8px)' }}
            onClick={() => navigate('/copilot')}>
            <Zap size={16} /> Open AI Growth Agent
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid-stats" style={{ marginBottom: 24 }}>
          <div className="stat-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="stat-card-icon purple"><Users size={20} /></div>
            <div className="stat-card-label">Total Customers</div>
            <div className="stat-card-value">{stats.totalCustomers?.toLocaleString() || '—'}</div>
          </div>
          <div className="stat-card animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="stat-card-icon green"><TrendingUp size={20} /></div>
            <div className="stat-card-label">Active</div>
            <div className="stat-card-value">{stats.activeCustomers?.toLocaleString() || '—'}</div>
          </div>
          <div className="stat-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="stat-card-icon orange"><TrendingDown size={20} /></div>
            <div className="stat-card-label">At Risk</div>
            <div className="stat-card-value">{stats.inactiveCustomers?.toLocaleString() || '—'}</div>
          </div>
          <div className="stat-card animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <div className="stat-card-icon blue"><span style={{ fontWeight: 700 }}>₹</span></div>
            <div className="stat-card-label">Total Revenue</div>
            <div className="stat-card-value">₹{stats.totalRevenue?.toLocaleString() || '—'}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Recent Campaigns */}
          <div className="card animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="card-header">
              <h3 className="card-title"><Megaphone size={16} style={{ marginRight: 8 }} />Recent Campaigns</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/campaigns')}>View all <ArrowRight size={14} /></button>
            </div>
            <div className="card-body" style={{ padding: '0 24px 16px' }}>
              {campaigns.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No campaigns yet</div>
              ) : campaigns.map((c) => (
                <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }}
                  onClick={() => navigate(`/campaigns/${c._id}`)}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                      <span className={`status-badge status-${c.status}`}>{c.status}</span>
                      <span className="tag tag-gray" style={{ fontSize: 11 }}>{c.channel}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-muted)' }}>
                    {c.stats?.sent || 0} sent
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunities */}
          <div className="card animate-slide-up" style={{ animationDelay: '0.35s' }}>
            <div className="card-header">
              <h3 className="card-title"><Target size={16} style={{ marginRight: 8 }} />Growth Opportunities</h3>
            </div>
            <div className="card-body" style={{ padding: '0 24px 16px' }}>
              {opportunities.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  Use AI Growth Agent to discover opportunities
                </div>
              ) : opportunities.slice(0, 4).map((opp) => (
                <div key={opp._id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{opp.title}</div>
                    <span className={`tag ${opp.priority === 'high' ? 'tag-red' : 'tag-orange'}`}>{opp.priority}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {opp.audienceSize} customers · ₹{opp.potentialRevenue?.toLocaleString()} potential
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
