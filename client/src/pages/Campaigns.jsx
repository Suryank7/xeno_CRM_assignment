import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Send, Eye, MousePointerClick, ShoppingBag, Users, AlertCircle } from 'lucide-react';
import Header from '../components/layout/Header';
import { getCampaigns } from '../services/api';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadCampaigns(); }, []);

  async function loadCampaigns() {
    try {
      const res = await getCampaigns();
      setCampaigns(res.data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  function getStatusClass(status) {
    return `status-badge status-${status}`;
  }

  function calcRate(num, den) {
    if (!den) return 0;
    return Math.round((num / den) * 100);
  }

  return (
    <>
      <Header title="Campaigns" subtitle="Track and manage your marketing campaigns">
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/copilot')}>
          <Megaphone size={16} /> Create with AI
        </button>
      </Header>

      <div className="app-content">
        {loading ? (
          <div className="animate-pulse" style={{ padding: 40, textAlign: 'center' }}>Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <Megaphone size={48} />
              <div className="empty-state-title">No campaigns yet</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                Use the AI Growth Agent to create your first campaign
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/copilot')}>
                Open AI Growth Agent
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {campaigns.map((campaign) => {
              const s = campaign.stats || {};
              return (
                <div
                  key={campaign._id}
                  className="card animate-slide-up"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/campaigns/${campaign._id}`)}
                >
                  <div style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: 18, fontWeight: 700 }}>{campaign.name}</h3>
                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                          <span className={getStatusClass(campaign.status)}>{campaign.status}</span>
                          <span className="tag tag-purple">{campaign.channel}</span>
                          <span className="tag tag-gray">
                            <Users size={12} /> {campaign.segmentId?.name || 'Unknown Segment'}
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Stats Row — Image 4 style stat cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
                      {[
                        { icon: Send, label: 'Sent', value: s.sent || 0, color: 'var(--info)' },
                        { icon: Send, label: 'Delivered', value: s.delivered || 0, color: 'var(--success)' },
                        { icon: AlertCircle, label: 'Failed', value: s.failed || 0, color: 'var(--error)' },
                        { icon: Eye, label: 'Opened', value: s.opened || 0, color: 'var(--primary-500)' },
                        { icon: MousePointerClick, label: 'Clicked', value: s.clicked || 0, color: 'var(--accent-500)' },
                        { icon: ShoppingBag, label: 'Purchased', value: s.purchased || 0, color: '#8b5cf6' },
                      ].map(({ icon: Icon, label, value, color }) => (
                        <div key={label} style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--bg-primary)', borderRadius: 10 }}>
                          <Icon size={16} style={{ color, marginBottom: 4 }} />
                          <div style={{ fontSize: 20, fontWeight: 700 }}>{value.toLocaleString()}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Progress Bar */}
                    {s.total > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                          <span>Delivery Progress</span>
                          <span>{calcRate(s.delivered, s.total)}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill purple" style={{ width: `${calcRate(s.delivered, s.total)}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
