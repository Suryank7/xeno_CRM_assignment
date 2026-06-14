import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, Sparkles, Users, Megaphone, BarChart3, Rocket, Plus, Zap,
  ArrowRight, TrendingUp, Target,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { aiChat, createSegment, createCampaign } from '../services/api';

const QUICK_PROMPTS = [
  { icon: Target, label: 'Find churning VIP customers', prompt: 'Find customers who spent over ₹5000 but haven\'t ordered in 60 days' },
  { icon: Megaphone, label: 'Win-back campaign', prompt: 'Create a win-back campaign for inactive customers' },
  { icon: TrendingUp, label: 'Increase revenue by ₹50K', prompt: 'Increase revenue by ₹50,000 this month' },
  { icon: Users, label: 'Discover opportunities', prompt: 'What growth opportunities exist in my customer base?' },
  { icon: Sparkles, label: 'Generate personas', prompt: 'Show me the different customer tribes in my data' },
];

export default function Copilot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(text) {
    const msg = text || input;
    if (!msg.trim() || loading) return;

    const userMsg = { role: 'user', content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiChat(msg);
      const { type, data } = res.data;

      const aiMsg = { role: 'ai', type, data, content: data.summary || 'Here are the results:' };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = { role: 'ai', type: 'error', content: '❌ ' + (err.response?.data?.error || err.message) };
      setMessages((prev) => [...prev, errMsg]);
    }
    setLoading(false);
    inputRef.current?.focus();
  }

  async function handleSaveSegment(audience) {
    try {
      await createSegment({
        name: audience.segmentName,
        description: audience.description,
        rules: audience.rules,
        createdBy: 'ai',
        aiExplanation: audience.explanation,
      });
      alert('✅ Segment saved!');
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  }

  async function handleCreateCampaign(plan) {
    try {
      // 1. First automatically save the segment
      const segRes = await createSegment({
        name: plan.audience.segmentName,
        description: plan.audience.description,
        rules: plan.audience.rules,
        createdBy: 'ai',
        aiExplanation: plan.audience.explanation,
      });
      const segmentId = segRes.data.data._id;

      // 2. Then create the campaign
      const res = await createCampaign({
        name: plan.campaign.name,
        segmentId: segmentId,
        channel: plan.channel.recommendation,
        messageTemplate: plan.campaign.variants?.[0]?.message || '',
        messageVariants: plan.campaign.variants,
        simulation: {
          emailPrediction: plan.channel.predictions?.find(p => p.channel === 'email'),
          smsPrediction: plan.channel.predictions?.find(p => p.channel === 'sms'),
          whatsappPrediction: plan.channel.predictions?.find(p => p.channel === 'whatsapp'),
          recommendedChannel: plan.channel.recommendation,
          reasoning: plan.channel.reasoning,
        },
        aiExplanation: plan.campaign.explanation,
      });
      navigate(`/campaigns/${res.data.data._id}`);
    } catch (err) {
      alert('Failed to create campaign: ' + (err.response?.data?.error || err.message));
    }
  }

  function renderAIMessage(msg) {
    if (msg.type === 'error') {
      return <div style={{ color: 'var(--error)' }}>{msg.content}</div>;
    }

    if (msg.type === 'campaign_plan') {
      return renderCampaignPlan(msg.data);
    }
    if (msg.type === 'autonomous_plan') {
      return renderAutonomousPlan(msg.data);
    }
    if (msg.type === 'opportunities') {
      return renderOpportunities(msg.data);
    }
    if (msg.type === 'personas') {
      return renderPersonas(msg.data);
    }

    return <div>{msg.content}</div>;
  }

  function renderCampaignPlan(plan) {
    return (
      <div>
        <div style={{ fontSize: 14, marginBottom: 16, lineHeight: 1.7 }}>{plan.summary}</div>

        {/* Audience */}
        <div style={{ padding: 16, background: 'var(--primary-50)', borderRadius: 12, marginBottom: 16, border: '1px solid var(--primary-200)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 700, color: 'var(--primary-700)' }}>🎯 {plan.audience?.segmentName}</div>
            <div style={{ fontWeight: 700, fontSize: 22, color: 'var(--primary-600)' }}>{plan.audience?.audienceSize}</div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{plan.audience?.description}</p>
          {plan.audience?.explanation?.reasoning && (
            <div style={{ marginTop: 8 }}>
              {plan.audience.explanation.reasoning.map((r, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '2px 0' }}>• {r}</div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn-sm btn-secondary" onClick={() => handleSaveSegment(plan.audience)}>
              <Plus size={14} /> Save Segment
            </button>
            <button className="btn btn-sm btn-primary" onClick={() => handleCreateCampaign(plan)}>
              <Zap size={14} /> Create Campaign
            </button>
          </div>
        </div>

        {/* Channel Recommendation */}
        {plan.channel && (
          <div style={{ padding: 16, background: '#ecfdf5', borderRadius: 12, marginBottom: 16, border: '1px solid #a7f3d0' }}>
            <div style={{ fontWeight: 700, color: '#059669', marginBottom: 4 }}>📡 Recommended: {plan.channel.recommendation?.toUpperCase()}</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{plan.channel.reasoning}</p>
            {plan.channel.predictions && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {plan.channel.predictions.map((p) => (
                  <span key={p.channel} className={`tag ${p.channel === plan.channel.recommendation ? 'tag-green' : 'tag-gray'}`}>
                    {p.channel}: {p.openRate}% open, {p.conversion}% conv
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Message Variants */}
        {plan.campaign?.variants && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>✍️ Message Variants</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {plan.campaign.variants.map((v) => (
                <div key={v.variantId} style={{
                  padding: 12,
                  background: v.variantId === plan.campaign.recommendedVariant ? '#fff7ed' : 'var(--bg-primary)',
                  borderRadius: 10,
                  border: v.variantId === plan.campaign.recommendedVariant ? '1px solid #fbbf24' : '1px solid var(--border-light)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span className="tag tag-purple" style={{ fontSize: 12 }}>Variant {v.variantId}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <span className="tag tag-gray">{v.tone}</span>
                      {v.predictedCTR && <span className="tag tag-blue">CTR: {v.predictedCTR}%</span>}
                    </div>
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.6 }}>{v.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderAutonomousPlan(plan) {
    return (
      <div>
        <div style={{ fontSize: 14, marginBottom: 12, lineHeight: 1.7 }}>{plan.summary}</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <span className="tag tag-green" style={{ fontSize: 14 }}>
            Predicted Revenue: ₹{plan.totalPredictedRevenue?.toLocaleString()}
          </span>
          <span className="tag tag-purple">{plan.campaigns?.length} campaigns</span>
        </div>

        {plan.campaigns?.map((c, i) => (
          <div key={i} style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 12, marginBottom: 12, border: '1px solid var(--border-light)' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Campaign {i + 1}: {c.campaign?.name}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              <span className="tag tag-purple">{c.audience?.segmentName}</span>
              <span className="tag tag-green">{c.audience?.audienceSize} customers</span>
              <span className="tag tag-blue">{c.channel?.recommendation}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.audience?.description}</p>
          </div>
        ))}
      </div>
    );
  }

  function renderOpportunities(data) {
    return (
      <div>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>🔍 Discovered {data.opportunities?.length} Growth Opportunities</div>
        {data.opportunities?.map((opp, i) => (
          <div key={i} className={`opportunity-card ${opp.priority}`} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ fontWeight: 700 }}>{opp.title}</div>
              <span className={`tag ${opp.priority === 'high' ? 'tag-red' : 'tag-orange'}`}>{opp.priority} priority</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{opp.description}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="tag tag-purple">{opp.audienceSize} customers</span>
              <span className="tag tag-green">₹{opp.potentialRevenue?.toLocaleString()} potential</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderPersonas(data) {
    return (
      <div>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>🧬 Customer Tribes</div>
        <div style={{ display: 'grid', gap: 12 }}>
          {data.personas?.map((p, i) => (
            <div key={i} style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{p.name}</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{p.description}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="tag tag-purple">{p.customerCount} customers</span>
                <span className="tag tag-gray">Age: {p.characteristics?.ageRange}</span>
                <span className="tag tag-green">Avg ₹{p.characteristics?.avgSpend?.toLocaleString()}</span>
                <span className="tag tag-blue">{p.characteristics?.preferredChannel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Header title="AI Growth Agent" subtitle="Your autonomous marketing copilot" />

      <div className="app-content" style={{ padding: 0, height: 'calc(100vh - var(--header-height))' }}>
        <div className="chat-container" style={{ borderRadius: 0, border: 'none', height: '100%' }}>

          {/* Chat Messages */}
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="animate-fade-in" style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 20,
                  background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px', boxShadow: 'var(--shadow-glow)',
                }}>
                  <Sparkles size={28} color="white" />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>What should we grow today?</h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 32px' }}>
                  I can find target audiences, create campaigns, predict performance, discover growth opportunities, and learn from results. Just tell me your goal.
                </p>

                {/* Quick Prompts */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, maxWidth: 700, margin: '0 auto' }}>
                  {QUICK_PROMPTS.map((qp) => (
                    <button
                      key={qp.label}
                      className="card"
                      style={{ padding: 16, cursor: 'pointer', textAlign: 'left', border: '1px solid var(--border-color)' }}
                      onClick={() => handleSend(qp.prompt)}
                    >
                      <qp.icon size={20} style={{ color: 'var(--primary-500)', marginBottom: 8 }} />
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{qp.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                {msg.role === 'ai' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Sparkles size={14} color="white" />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary-600)' }}>Xeno Pulse AI</span>
                  </div>
                )}
                <div className={`chat-bubble ${msg.role}`}>
                  {msg.role === 'user' ? msg.content : renderAIMessage(msg)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-message ai">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Sparkles size={14} color="white" />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary-600)' }}>Xeno Pulse AI</span>
                </div>
                <div className="chat-bubble ai">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="animate-pulse" style={{ display: 'flex', gap: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-400)' }} />
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-300)' }} />
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary-200)' }} />
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Running multi-agent pipeline...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <input
              ref={inputRef}
              className="chat-input"
              placeholder="Tell me your marketing goal..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <button className="btn btn-primary" onClick={() => handleSend()} disabled={loading || !input.trim()}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
