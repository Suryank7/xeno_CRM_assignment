import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShoppingCart, MapPin, Phone, Mail,
  TrendingUp, TrendingDown, Zap, Heart,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { getCustomerById } from '../services/api';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomer();
  }, [id]);

  async function loadCustomer() {
    try {
      const res = await getCustomerById(id);
      setCustomer(res.data.data);
    } catch (err) {
      console.error('Failed to load customer:', err);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <>
        <Header title="Customer Detail" />
        <div className="app-content"><div className="animate-pulse" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div></div>
      </>
    );
  }

  if (!customer) {
    return (
      <>
        <Header title="Customer Not Found" />
        <div className="app-content"><div className="empty-state"><div className="empty-state-title">Customer not found</div></div></div>
      </>
    );
  }

  const twin = customer.digitalTwin || {};
  const initials = customer.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  function riskColor(risk) {
    if (risk === 'high') return 'var(--error)';
    if (risk === 'medium') return 'var(--accent-500)';
    return 'var(--success)';
  }

  return (
    <>
      <Header title="Customer Profile">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/customers')}>
          <ArrowLeft size={16} /> Back
        </button>
      </Header>

      <div className="app-content">
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24 }}>

          {/* Left Panel — Image 3 profile card inspired */}
          <div>
            <div className="twin-profile animate-slide-up">
              <div className="twin-cover" />
              <div className="twin-avatar-wrapper">
                <div className="twin-avatar">{initials}</div>
              </div>
              <div className="twin-info">
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>{customer.name}</h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  {customer.city || 'Unknown City'} · Age {customer.age || '?'}
                </p>

                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <Mail size={14} /> {customer.email}
                  </div>
                </div>
                {customer.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                    <Phone size={14} /> {customer.phone}
                  </div>
                )}

                {/* Interest Tags — Image 3 */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.05em' }}>
                    Tags
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {customer.tags?.map((tag) => (
                      <span key={tag} className="tag tag-purple">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Activity Summary — Image 3 timeline icons */}
                <div style={{ display: 'flex', gap: 16, padding: '16px 0', borderTop: '1px solid var(--border-light)' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <ShoppingCart size={20} style={{ color: 'var(--primary-500)', margin: '0 auto 4px' }} />
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{customer.totalOrders}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Orders</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <span style={{ fontSize: 20, color: 'var(--success)' }}>₹</span>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>₹{(customer.totalSpent || 0).toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Spent</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel — Digital Twin + Charts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Digital Twin — Feature 8 */}
            <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="card-header">
                <h3 className="card-title">🧬 Digital Twin</h3>
                <span className="tag tag-purple"><Zap size={12} /> AI Generated</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* Purchase Probability — Donut inspired by Image 2 */}
                  <div style={{ textAlign: 'center', padding: 16, background: 'var(--bg-primary)', borderRadius: 12 }}>
                    <div className="donut-chart" style={{ width: 100, height: 100, margin: '0 auto' }}>
                      <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-light)" strokeWidth="8" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--primary-500)" strokeWidth="8"
                          strokeDasharray={`${(twin.purchaseProbability || 0) * 2.64} 264`}
                          strokeLinecap="round" />
                      </svg>
                      <div className="donut-center">
                        <div className="donut-value">{twin.purchaseProbability || 0}%</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>Purchase Probability</div>
                  </div>

                  {/* Churn Risk */}
                  <div style={{ textAlign: 'center', padding: 16, background: 'var(--bg-primary)', borderRadius: 12 }}>
                    <div className="donut-chart" style={{ width: 100, height: 100, margin: '0 auto' }}>
                      <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border-light)" strokeWidth="8" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke={riskColor(twin.churnRisk)} strokeWidth="8"
                          strokeDasharray={`${(twin.churnRisk === 'high' ? 85 : twin.churnRisk === 'medium' ? 55 : 25) * 2.64} 264`}
                          strokeLinecap="round" />
                      </svg>
                      <div className="donut-center">
                        <div className="donut-value" style={{ color: riskColor(twin.churnRisk), fontSize: 16 }}>
                          {twin.churnRisk || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>Churn Risk</div>
                  </div>
                </div>

                {/* Twin Metrics — Image 3 avg spending / churn style */}
                <div style={{ marginTop: 20 }}>
                  <div className="twin-metric">
                    <span className="twin-metric-label">Preferred Channel</span>
                    <span className="tag tag-purple">{twin.preferredChannel || 'N/A'}</span>
                  </div>
                  <div className="twin-metric">
                    <span className="twin-metric-label">Purchase Window</span>
                    <span className="twin-metric-value">{twin.likelyPurchaseWindow || 'N/A'}</span>
                  </div>
                  <div className="twin-metric">
                    <span className="twin-metric-label">Discount Sensitivity</span>
                    <span className={`tag ${twin.discountSensitivity === 'high' ? 'tag-orange' : twin.discountSensitivity === 'medium' ? 'tag-blue' : 'tag-green'}`}>
                      {twin.discountSensitivity || 'N/A'}
                    </span>
                  </div>
                  <div className="twin-metric">
                    <span className="twin-metric-label">Lifetime Value Prediction</span>
                    <span className="twin-metric-value">₹{(twin.lifetimeValuePrediction || 0).toLocaleString()}</span>
                  </div>
                  <div className="twin-metric">
                    <span className="twin-metric-label">Top Categories</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {twin.topCategories?.map((cat) => (
                        <span key={cat} className="tag tag-gray">{cat}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Table — Image 2 appointment table style */}
            <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="card-header">
                <h3 className="card-title">Recent Orders</h3>
              </div>
              <div className="card-body" style={{ padding: '0 24px 24px' }}>
                {customer.orders?.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.orders.map((order) => (
                        <tr key={order._id}>
                          <td style={{ fontWeight: 600 }}>{order.orderNumber}</td>
                          <td>₹{order.amount?.toLocaleString()}</td>
                          <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                          <td><span className={`status-badge status-${order.status === 'delivered' ? 'completed' : 'sending'}`}>{order.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No orders yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
