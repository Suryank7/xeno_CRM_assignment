import { useState, useEffect } from 'react';
import { Layers, Plus, Sparkles, Users, Trash2 } from 'lucide-react';
import Header from '../components/layout/Header';
import { getSegments, createSegment, deleteSegment, aiSuggestSegment } from '../services/api';

export default function Segments() {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nlQuery, setNlQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => { loadSegments(); }, []);

  async function loadSegments() {
    try {
      const res = await getSegments();
      setSegments(res.data.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  async function handleNLQuery() {
    if (!nlQuery.trim()) return;
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await aiSuggestSegment(nlQuery);
      setAiResult(res.data.data);
    } catch (err) {
      alert('AI failed: ' + (err.response?.data?.error || err.message));
    }
    setAiLoading(false);
  }

  async function saveAISegment() {
    if (!aiResult) return;
    try {
      await createSegment({
        name: aiResult.segmentName,
        description: aiResult.description,
        rules: aiResult.rules,
        createdBy: 'ai',
        aiExplanation: aiResult.explanation,
      });
      setAiResult(null);
      setNlQuery('');
      loadSegments();
    } catch (err) {
      alert('Failed to save: ' + err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this segment?')) return;
    try {
      await deleteSegment(id);
      loadSegments();
    } catch (err) { alert('Failed to delete'); }
  }

  return (
    <>
      <Header title="Segments" subtitle="Define and manage audience segments" />

      <div className="app-content">
        {/* NL Audience Builder — Feature 2 */}
        <div className="card animate-slide-up" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={18} style={{ color: 'var(--primary-500)' }} />
              AI Audience Builder
            </h3>
            <span className="tag tag-purple">Natural Language</span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Describe your target audience in plain English. AI will translate it into a database query.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <input
                className="chat-input"
                placeholder={`e.g. "Customers who spent over ₹5000 but haven't ordered in 90 days"`}
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNLQuery()}
              />
              <button className="btn btn-primary" onClick={handleNLQuery} disabled={aiLoading}>
                {aiLoading ? '⏳ Thinking...' : '🔍 Find Audience'}
              </button>
            </div>

            {/* AI Result */}
            {aiResult && (
              <div style={{ marginTop: 20, padding: 20, background: 'var(--primary-50)', borderRadius: 12, border: '1px solid var(--primary-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <div>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary-700)' }}>{aiResult.segmentName}</h4>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{aiResult.description}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary-600)' }}>{aiResult.audienceSize}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>customers found</div>
                  </div>
                </div>

                {/* Explainability — Feature 10 */}
                {aiResult.explanation?.reasoning && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>Why this audience?</div>
                    {aiResult.explanation.reasoning.map((r, i) => (
                      <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '4px 0', display: 'flex', gap: 6 }}>
                        <span style={{ color: 'var(--primary-500)' }}>•</span> {r}
                      </div>
                    ))}
                    <div style={{ marginTop: 8 }}>
                      <span className="tag tag-purple">Confidence: {aiResult.explanation.confidence}%</span>
                    </div>
                  </div>
                )}

                {/* Sample customers */}
                {aiResult.sample?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>Sample Customers</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {aiResult.sample.map((s) => (
                        <span key={s._id} className="tag tag-gray">{s.name} · ₹{s.totalSpent?.toLocaleString()}</span>
                      ))}
                    </div>
                  </div>
                )}

                <button className="btn btn-primary" onClick={saveAISegment}>
                  <Plus size={16} /> Save Segment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Segments List */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Saved Segments</h3>
            <span className="tag tag-gray">{segments.length} segments</span>
          </div>
          <div className="card-body" style={{ padding: '0 24px 24px' }}>
            {loading ? (
              <div className="animate-pulse" style={{ padding: 20, textAlign: 'center' }}>Loading...</div>
            ) : segments.length === 0 ? (
              <div className="empty-state">
                <Layers size={48} />
                <div className="empty-state-title">No segments yet</div>
                <p style={{ fontSize: 13 }}>Use the AI builder above to create your first segment</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Segment Name</th>
                    <th>Audience Size</th>
                    <th>Created By</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {segments.map((seg) => (
                    <tr key={seg._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{seg.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{seg.description}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Users size={14} style={{ color: 'var(--primary-500)' }} />
                          <span style={{ fontWeight: 600 }}>{seg.audienceSize?.toLocaleString()}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`tag ${seg.createdBy === 'ai' ? 'tag-purple' : 'tag-gray'}`}>
                          {seg.createdBy === 'ai' ? '🤖 AI' : '👤 Manual'}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        {new Date(seg.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(seg._id)}>
                          <Trash2 size={14} style={{ color: 'var(--error)' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
