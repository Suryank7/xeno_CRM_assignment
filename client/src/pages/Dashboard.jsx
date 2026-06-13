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
  const [executiveBrief, setExecutiveBrief] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [channelStats, setChannelStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get current user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user?.name ? user.name.split(' ')[0] : 'there';

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [statsRes, campRes, segRes, oppRes, briefRes, anomalyRes, channelRes] = await Promise.all([
        getCustomerStats(),
        getCampaigns(),
        getSegments(),
        getOpportunities().catch(() => ({ data: { data: [] } })),
        import('../services/api').then(m => m.getExecutiveBrief()).catch(() => ({ data: { data: null } })),
        import('../services/api').then(m => m.getAnomalies()).catch(() => ({ data: { data: [] } })),
        import('../services/api').then(m => m.getChannelStats()).catch(() => ({ data: { data: [] } }))
      ]);
      setStats(statsRes.data.data);
      setCampaigns(campRes.data.data.slice(0, 5));
      setSegments(segRes.data.data.slice(0, 5));
      setOpportunities(oppRes.data.data || []);
      setExecutiveBrief(briefRes.data.data);
      setAnomalies(anomalyRes.data.data || []);
      setChannelStats(channelRes.data.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  return (
    <>
      <Header title="Dashboard" subtitle="Xeno Pulse AI — Autonomous Growth Engine" />

      <div className="app-content">
        {/* Dynamic Welcome Banner & Quick Actions */}
        <div className="card animate-slide-up" style={{
          padding: '32px 40px',
          background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
          color: 'white',
          marginBottom: 24,
          borderRadius: 16,
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24
        }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Good to see you, {userName}! 👋</h2>
            <p style={{ opacity: 0.9, fontSize: 15, maxWidth: 500, margin: 0, lineHeight: 1.5 }}>
              Your autonomous growth engine is actively monitoring {stats.totalCustomers?.toLocaleString() || 0} customers. 
              Ready to launch your next high-converting campaign?
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn" style={{ background: 'white', color: 'var(--primary-700)', fontWeight: 600, border: 'none' }}
              onClick={() => navigate('/copilot')}>
              <Sparkles size={16} /> Use AI Copilot
            </button>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}
              onClick={() => navigate('/segments')}>
              <Layers size={16} /> Build Audience
            </button>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}
              onClick={() => navigate('/customers')}>
              <Users size={16} /> Manage Data
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid-stats" style={{ marginBottom: 24 }}>
          <div className="stat-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="stat-card-icon purple"><Users size={20} /></div>
            <div className="stat-card-label">Total Customers</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="stat-card-value">{stats.totalCustomers?.toLocaleString() || '—'}</div>
              {stats.trends?.customersWoW !== undefined && (
                <div style={{ fontSize: 12, fontWeight: 600, color: stats.trends.customersWoW >= 0 ? 'var(--success)' : 'var(--error)', background: stats.trends.customersWoW >= 0 ? '#ecfdf5' : '#fef2f2', padding: '2px 6px', borderRadius: 12 }}>
                  {stats.trends.customersWoW >= 0 ? '↑' : '↓'} {Math.abs(stats.trends.customersWoW)}%
                </div>
              )}
            </div>
          </div>
          <div className="stat-card animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="stat-card-icon green"><TrendingUp size={20} /></div>
            <div className="stat-card-label">Active</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="stat-card-value">{stats.activeCustomers?.toLocaleString() || '—'}</div>
              {stats.trends?.activeWoW !== undefined && (
                <div style={{ fontSize: 12, fontWeight: 600, color: stats.trends.activeWoW >= 0 ? 'var(--success)' : 'var(--error)', background: stats.trends.activeWoW >= 0 ? '#ecfdf5' : '#fef2f2', padding: '2px 6px', borderRadius: 12 }}>
                  {stats.trends.activeWoW >= 0 ? '↑' : '↓'} {Math.abs(stats.trends.activeWoW)}%
                </div>
              )}
            </div>
          </div>
          <div className="stat-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="stat-card-icon orange"><TrendingDown size={20} /></div>
            <div className="stat-card-label">At Risk</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="stat-card-value">{stats.inactiveCustomers?.toLocaleString() || '—'}</div>
              {stats.trends?.inactiveWoW !== undefined && (
                <div style={{ fontSize: 12, fontWeight: 600, color: stats.trends.inactiveWoW <= 0 ? 'var(--success)' : 'var(--error)', background: stats.trends.inactiveWoW <= 0 ? '#ecfdf5' : '#fef2f2', padding: '2px 6px', borderRadius: 12 }}>
                  {stats.trends.inactiveWoW >= 0 ? '↑' : '↓'} {Math.abs(stats.trends.inactiveWoW)}%
                </div>
              )}
            </div>
          </div>
          <div className="stat-card animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <div className="stat-card-icon blue"><span style={{ fontWeight: 700 }}>₹</span></div>
            <div className="stat-card-label">Total Revenue</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="stat-card-value">₹{stats.totalRevenue?.toLocaleString() || '—'}</div>
              {stats.trends?.revenueWoW !== undefined && (
                <div style={{ fontSize: 12, fontWeight: 600, color: stats.trends.revenueWoW >= 0 ? 'var(--success)' : 'var(--error)', background: stats.trends.revenueWoW >= 0 ? '#ecfdf5' : '#fef2f2', padding: '2px 6px', borderRadius: 12 }}>
                  {stats.trends.revenueWoW >= 0 ? '↑' : '↓'} {Math.abs(stats.trends.revenueWoW)}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Executive Briefing */}
        {executiveBrief && (
          <div className="card animate-slide-up" style={{ marginBottom: 24, animationDelay: '0.28s' }}>
            <div className="card-header" style={{ paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ 
                  background: 'var(--primary-100)', color: 'var(--primary-600)', 
                  width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Executive Briefing</h3>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>AI-generated business health summary</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: executiveBrief.healthScore >= 70 ? 'var(--success)' : 'var(--error)' }}>
                  {executiveBrief.healthScore}/100
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Health Score</div>
              </div>
            </div>
            <div className="card-body" style={{ padding: '0 24px 24px' }}>
              <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--primary-600)', marginBottom: 16, fontStyle: 'italic' }}>
                "{executiveBrief.headline}"
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <h5 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Key Insights</h5>
                  <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
                    {executiveBrief.bullets?.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </div>
                <div>
                  {executiveBrief.risks?.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <h5 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--error)', marginBottom: 8 }}>Identified Risks</h5>
                      {executiveBrief.risks.map((r, i) => (
                        <div key={i} style={{ fontSize: 13, display: 'flex', gap: 8, marginBottom: 4 }}>
                          <span style={{ color: 'var(--error)' }}>•</span>
                          <span><strong>{r.title}</strong>: {r.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div>
                    <h5 style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--success)', marginBottom: 8 }}>Recommendation</h5>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', background: 'var(--primary-50)', padding: '12px 16px', borderRadius: 8, borderLeft: '3px solid var(--primary-500)' }}>
                      {executiveBrief.recommendation}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Anomaly Alerts */}
        {anomalies?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            {anomalies.map((anomaly) => (
              <div key={anomaly._id} className="card animate-slide-up" style={{ 
                borderLeft: `4px solid ${anomaly.severity === 'high' ? 'var(--error)' : anomaly.severity === 'medium' ? 'var(--accent-500)' : 'var(--info)'}`,
                padding: '16px 24px',
                marginBottom: 12,
                background: anomaly.severity === 'high' ? '#fef2f2' : '#fff7ed'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ color: anomaly.severity === 'high' ? 'var(--error)' : 'var(--accent-500)', marginTop: 2 }}>
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: anomaly.severity === 'high' ? '#991b1b' : '#9a3412' }}>
                      {anomaly.description}
                    </h4>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                      <strong>Campaign:</strong> {anomaly.campaignId?.name || 'Unknown'} | <strong style={{ textTransform: 'capitalize' }}>Channel:</strong> {anomaly.campaignId?.channel || 'Unknown'}
                    </div>
                    {anomaly.aiExplanation && (
                      <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-primary)', background: 'rgba(255,255,255,0.6)', padding: '8px 12px', borderRadius: 8 }}>
                        <strong>AI Diagnosis:</strong> {anomaly.aiExplanation}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
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
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className={`tag ${opp.priority === 'high' ? 'tag-red' : 'tag-orange'}`}>{opp.priority}</span>
                      <button 
                        className="btn btn-primary btn-sm" 
                        style={{ padding: '4px 10px', fontSize: 11 }}
                        onClick={() => navigate('/copilot', { state: { initialPrompt: `Create a campaign for ${opp.title} to ${opp.suggestedAction}` } })}
                      >
                        <Zap size={12} style={{ marginRight: 4 }} /> Act
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    {opp.audienceSize} customers · ₹{opp.potentialRevenue?.toLocaleString()} potential
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Channel Performance */}
          <div className="card animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="card-header">
              <h3 className="card-title"><Layers size={16} style={{ marginRight: 8 }} />Channel Performance</h3>
            </div>
            <div className="card-body" style={{ padding: '0 24px 16px' }}>
              {channelStats.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No channel data</div>
              ) : channelStats.map((stat) => (
                <div key={stat._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{stat._id}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{stat.campaigns} campaigns</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--primary-600)' }}>
                      {stat.sent > 0 ? Math.round((stat.opened / stat.sent) * 100) : 0}% Open
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 2 }}>
                      {stat.sent > 0 ? Math.round((stat.purchased / stat.sent) * 100) : 0}% Conv
                    </div>
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
