import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, Eye, MousePointerClick, ShoppingBag, AlertCircle,
  Rocket, BookOpen, Sparkles,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { getCampaignById, launchCampaign, getCampaignMessages, aiLearn } from '../services/api';

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [learning, setLearning] = useState(null);
  const [learningLoading, setLearningLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('journey');

  useEffect(() => { loadCampaign(); }, [id]);

  async function loadCampaign() {
    try {
      const [campRes, msgRes] = await Promise.all([
        getCampaignById(id),
        getCampaignMessages(id),
      ]);
      setCampaign(campRes.data.data);
      setMessages(msgRes.data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  async function handleLaunch() {
    if (!confirm('Launch this campaign? Messages will be sent.')) return;
    setLaunching(true);
    try {
      await launchCampaign(id);
      // Refresh stats periodically
      const interval = setInterval(async () => {
        try {
          const res = await getCampaignById(id);
          setCampaign(res.data.data);
          if (res.data.data.status === 'completed' || res.data.data.status === 'failed') {
            clearInterval(interval);
            const msgRes = await getCampaignMessages(id);
            setMessages(msgRes.data.data);
          }
        } catch (e) { clearInterval(interval); }
      }, 3000);
    } catch (err) {
      alert('Launch failed: ' + (err.response?.data?.error || err.message));
    }
    setLaunching(false);
  }

  async function handleLearn() {
    setLearningLoading(true);
    try {
      const res = await aiLearn(id);
      setLearning(res.data.data);
    } catch (err) {
      alert('Learning failed: ' + err.message);
    }
    setLearningLoading(false);
  }

  if (loading) return <><Header title="Campaign Detail" /><div className="app-content"><div className="animate-pulse" style={{ padding: 40, textAlign: 'center' }}>Loading...</div></div></>;
  if (!campaign) return <><Header title="Not Found" /><div className="app-content"><div className="empty-state"><div className="empty-state-title">Campaign not found</div></div></div></>;

  const s = campaign.stats || {};

  const funnelSteps = [
    { label: 'Sent', value: s.sent, icon: Send, color: 'var(--info)', bg: '#eff6ff' },
    { label: 'Delivered', value: s.delivered, icon: Send, color: 'var(--success)', bg: '#ecfdf5' },
    { label: 'Opened', value: s.opened, icon: Eye, color: 'var(--primary-500)', bg: 'var(--primary-50)' },
    { label: 'Clicked', value: s.clicked, icon: MousePointerClick, color: 'var(--accent-500)', bg: '#fff7ed' },
    { label: 'Purchased', value: s.purchased, icon: ShoppingBag, color: '#8b5cf6', bg: '#f5f3ff' },
  ];

  return (
    <>
      <Header title={campaign.name}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/campaigns')}><ArrowLeft size={16} /> Back</button>
        {campaign.status === 'draft' && (
          <button className="btn btn-primary btn-sm" onClick={handleLaunch} disabled={launching}>
            <Rocket size={16} /> {launching ? 'Launching...' : 'Launch Campaign'}
          </button>
        )}
        {campaign.status === 'completed' && (
          <button className="btn btn-secondary btn-sm" onClick={handleLearn} disabled={learningLoading}>
            <BookOpen size={16} /> {learningLoading ? 'Analyzing...' : 'Learn from Results'}
          </button>
        )}
      </Header>

      <div className="app-content">
        {/* Meta Info */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <span className={`status-badge status-${campaign.status}`}>{campaign.status}</span>
          <span className="tag tag-purple">{campaign.channel}</span>
          <span className="tag tag-gray">{s.total} recipients</span>
          {campaign.completedAt && <span className="tag tag-green">Completed {new Date(campaign.completedAt).toLocaleString()}</span>}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border-color)', paddingBottom: 0 }}>
          {['journey', 'variants', 'messages', 'explainability'].map((tab) => (
            <button
              key={tab}
              className={`btn btn-ghost btn-sm`}
              style={{
                borderBottom: activeTab === tab ? '2px solid var(--primary-500)' : '2px solid transparent',
                borderRadius: 0,
                color: activeTab === tab ? 'var(--primary-600)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab ? 600 : 500,
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab: Journey Funnel — Feature 11 */}
        {activeTab === 'journey' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="card">
              <div className="card-header"><h3 className="card-title">📊 Campaign Journey</h3></div>
              <div className="card-body">
                {funnelSteps.map((step, i) => {
                  const pct = s.total > 0 ? Math.round((step.value / s.total) * 100) : 0;
                  return (
                    <div key={step.label} className="funnel-step" style={{ animationDelay: `${i * 0.1}s` }}>
                      <div className="funnel-icon" style={{ background: step.bg, color: step.color }}>
                        <step.icon size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{step.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: step.color }}>{step.value?.toLocaleString() || 0} ({pct}%)</span>
                        </div>
                        <div className="funnel-bar">
                          <div className="funnel-fill" style={{ width: `${pct}%`, background: step.color }} />
                        </div>
                      </div>
                    </div>
                  );
                })}

                {s.failed > 0 && (
                  <div className="funnel-step">
                    <div className="funnel-icon" style={{ background: '#fef2f2', color: 'var(--error)' }}><AlertCircle size={18} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>Failed</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--error)' }}>{s.failed}</span>
                      </div>
                      <div className="funnel-bar"><div className="funnel-fill" style={{ width: `${s.total > 0 ? Math.round((s.failed / s.total) * 100) : 0}%`, background: 'var(--error)' }} /></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Donut + Stats — Image 2 dynamics style */}
            <div className="card">
              <div className="card-header"><h3 className="card-title">📈 Conversion Rate</h3></div>
              <div className="card-body" style={{ textAlign: 'center' }}>
                <div className="donut-chart" style={{ width: 160, height: 160, margin: '0 auto 20px' }}>
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="65" fill="none" stroke="var(--border-light)" strokeWidth="12" />
                    <circle cx="80" cy="80" r="65" fill="none" stroke="var(--primary-500)" strokeWidth="12"
                      strokeDasharray={`${(s.total > 0 ? (s.delivered / s.total) * 100 : 0) * 4.08} 408`}
                      strokeLinecap="round" />
                    <circle cx="80" cy="80" r="50" fill="none" stroke="var(--success)" strokeWidth="10"
                      strokeDasharray={`${(s.delivered > 0 ? (s.opened / s.delivered) * 100 : 0) * 3.14} 314`}
                      strokeLinecap="round" />
                    <circle cx="80" cy="80" r="37" fill="none" stroke="var(--accent-500)" strokeWidth="8"
                      strokeDasharray={`${(s.opened > 0 ? (s.clicked / s.opened) * 100 : 0) * 2.32} 232`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="donut-center">
                    <div className="donut-value">{s.total > 0 ? Math.round((s.purchased / s.total) * 100) : 0}%</div>
                    <div className="donut-label">conversion</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  <div style={{ padding: 12, background: 'var(--bg-primary)', borderRadius: 10 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>{s.delivered > 0 ? Math.round((s.opened / s.delivered) * 100) : 0}%</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Open Rate</div>
                  </div>
                  <div style={{ padding: 12, background: 'var(--bg-primary)', borderRadius: 10 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-500)' }}>{s.opened > 0 ? Math.round((s.clicked / s.opened) * 100) : 0}%</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click Rate</div>
                  </div>
                  <div style={{ padding: 12, background: 'var(--bg-primary)', borderRadius: 10 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#8b5cf6' }}>{s.clicked > 0 ? Math.round((s.purchased / s.clicked) * 100) : 0}%</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Purchase Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Message Variants — Feature 6 Tournament */}
        {activeTab === 'variants' && (
          <div className="grid-opportunities">
            {(campaign.messageVariants || []).length > 0 ? campaign.messageVariants.map((v) => (
              <div key={v.variantId} className={`card ${v.isWinner ? 'opportunity-card high' : ''}`}>
                <div style={{ padding: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span className="tag tag-purple" style={{ fontSize: 14, fontWeight: 700 }}>Variant {v.variantId}</span>
                    {v.isWinner && <span className="tag tag-green">🏆 Winner</span>}
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 12, color: 'var(--text-secondary)' }}>{v.message}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className="tag tag-gray">{v.tone}</span>
                    {v.predictedCTR && <span className="tag tag-blue">CTR: {v.predictedCTR}%</span>}
                  </div>
                </div>
              </div>
            )) : (
              <div className="card"><div className="empty-state"><div className="empty-state-title">No message variants</div></div></div>
            )}
          </div>
        )}

        {/* Tab: Individual Messages */}
        {activeTab === 'messages' && (
          <div className="card">
            <table className="data-table">
              <thead><tr><th>Customer</th><th>Content</th><th>Status</th><th>Sent At</th></tr></thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg._id}>
                    <td style={{ fontWeight: 600 }}>{msg.customerId?.name || 'Unknown'}</td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.content}</td>
                    <td><span className={`status-badge status-${msg.status === 'purchased' ? 'completed' : msg.status === 'failed' ? 'failed' : 'sending'}`}>{msg.status}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab: AI Explainability — Feature 10 */}
        {activeTab === 'explainability' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="card">
              <div className="card-header"><h3 className="card-title">🧠 AI Reasoning</h3></div>
              <div className="card-body">
                {campaign.aiExplanation?.reasoning?.length > 0 ? (
                  <>
                    {campaign.aiExplanation.reasoning.map((r, i) => (
                      <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)', fontSize: 14, display: 'flex', gap: 8 }}>
                        <Sparkles size={16} style={{ color: 'var(--primary-500)', flexShrink: 0, marginTop: 2 }} />
                        {r}
                      </div>
                    ))}
                    <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
                      <span className="tag tag-purple">Confidence: {campaign.aiExplanation.confidence}%</span>
                      {campaign.aiExplanation.dataPointsUsed && <span className="tag tag-gray">{campaign.aiExplanation.dataPointsUsed} data points</span>}
                    </div>
                  </>
                ) : (
                  <div style={{ color: 'var(--text-muted)', padding: 20 }}>No AI explanation available for this campaign</div>
                )}
              </div>
            </div>

            {/* Learning Results — Feature 12 */}
            {learning && (
              <div className="card animate-slide-up">
                <div className="card-header"><h3 className="card-title">📚 Learnings</h3></div>
                <div className="card-body">
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary-600)', marginBottom: 8 }}>
                    {learning.analysis?.analytics?.performanceScore || '?'}/100
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Performance Score</div>

                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Insights</div>
                  {learning.analysis?.analytics?.insights?.map((ins, i) => (
                    <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '4px 0' }}>• {ins}</div>
                  ))}

                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 16, marginBottom: 8 }}>Recommendations</div>
                  {learning.analysis?.learnings?.recommendations?.map((rec, i) => (
                    <div key={i} style={{ fontSize: 13, color: 'var(--primary-600)', padding: '4px 0' }}>→ {rec}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
