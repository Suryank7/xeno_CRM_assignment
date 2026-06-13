import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Download, Search, Grid3X3, List, Filter, TrendingUp, TrendingDown, Users } from 'lucide-react';
import Header from '../components/layout/Header';
import { getCustomers, getCustomerStats, uploadCustomers, exportCustomersCSV } from '../services/api';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [page, search]);

  async function loadData() {
    setLoading(true);
    try {
      const [custRes, statsRes] = await Promise.all([
        getCustomers({ page, limit: 20, search }),
        getCustomerStats(),
      ]);
      setCustomers(custRes.data.data);
      setPagination(custRes.data.pagination);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
    setLoading(false);
  }

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadCustomers(file);
      alert(`✅ ${res.data.message}`);
      loadData();
    } catch (err) {
      alert('❌ Upload failed: ' + (err.response?.data?.error || err.message));
    }
    setUploading(false);
    e.target.value = '';
  }

  async function handleExport() {
    setExporting(true);
    try {
      const response = await exportCustomersCSV();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'customers_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('❌ Export failed: ' + err.message);
    }
    setExporting(false);
  }

  function getInitials(name) {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  }

  function getChurnColor(risk) {
    if (risk === 'high') return 'tag-red';
    if (risk === 'medium') return 'tag-orange';
    return 'tag-green';
  }

  return (
    <>
      <Header title="Customers" subtitle={`${stats.totalCustomers || 0} total customers`}>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExport} disabled={exporting}>
            <Download size={16} />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => fileRef.current?.click()}>
            <Upload size={16} />
            {uploading ? 'Uploading...' : 'Upload CSV'}
          </button>
        </div>
        <input ref={fileRef} type="file" accept=".csv" onChange={handleUpload} hidden />
      </Header>

      <div className="app-content">
        {/* Stat Cards — Image 4 StoreSync inspired */}
        <div className="grid-stats" style={{ marginBottom: 24 }}>
          <div className="stat-card">
            <div className="stat-card-icon purple"><Users size={20} /></div>
            <div className="stat-card-label">Total Customers</div>
            <div className="stat-card-value">{stats.totalCustomers?.toLocaleString() || '—'}</div>
            <div className="stat-card-trend up"><TrendingUp size={12} /> Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon green"><TrendingUp size={20} /></div>
            <div className="stat-card-label">Active (30d)</div>
            <div className="stat-card-value">{stats.activeCustomers?.toLocaleString() || '—'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon orange"><TrendingDown size={20} /></div>
            <div className="stat-card-label">Inactive (90d+)</div>
            <div className="stat-card-value">{stats.inactiveCustomers?.toLocaleString() || '—'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon blue"><span style={{ fontSize: 16, fontWeight: 700 }}>₹</span></div>
            <div className="stat-card-label">Avg. Spend</div>
            <div className="stat-card-value">₹{stats.avgSpent?.toLocaleString() || '—'}</div>
          </div>
        </div>

        {/* Filter Bar — Image 1 inspired */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div className="header-search" style={{ width: 260 }}>
              <Search size={16} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by name, email, city..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <button className="btn btn-secondary btn-sm"><Filter size={14} /> Filters</button>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              <button
                className={`btn btn-icon ${view === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setView('grid')}
                style={{ padding: '6px 8px' }}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                className={`btn btn-icon ${view === 'list' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setView('list')}
                style={{ padding: '6px 8px' }}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Customer Grid — Image 1 card layout */}
        {loading ? (
          <div className="grid-customers">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="customer-card">
                <div className="skeleton" style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 12px' }} />
                <div className="skeleton" style={{ width: '60%', height: 16, margin: '0 auto 8px' }} />
                <div className="skeleton" style={{ width: '80%', height: 12, margin: '0 auto' }} />
              </div>
            ))}
          </div>
        ) : view === 'grid' ? (
          <div className="grid-customers">
            {customers.map((c) => (
              <div key={c._id} className="customer-card" onClick={() => navigate(`/customers/${c._id}`)}>
                <div className="customer-avatar">{getInitials(c.name)}</div>
                <div className="customer-name">{c.name}</div>
                <div className="customer-email">{c.email}</div>
                <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                  {c.digitalTwin?.churnRisk && (
                    <span className={`tag ${getChurnColor(c.digitalTwin.churnRisk)}`}>
                      {c.digitalTwin.churnRisk} risk
                    </span>
                  )}
                  {c.tags?.slice(0, 2).map((tag) => (
                    <span key={tag} className="tag tag-gray">{tag}</span>
                  ))}
                </div>
                <div className="customer-stats">
                  <div className="customer-stat">
                    <div className="customer-stat-value">{c.totalOrders}</div>
                    <div className="customer-stat-label">Orders</div>
                  </div>
                  <div className="customer-stat">
                    <div className="customer-stat-value">₹{(c.totalSpent || 0).toLocaleString()}</div>
                    <div className="customer-stat-label">Spent</div>
                  </div>
                  <div className="customer-stat">
                    <div className="customer-stat-value">{c.city || '—'}</div>
                    <div className="customer-stat-label">City</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View — Image 2 table inspired */
          <div className="card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>City</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Churn Risk</th>
                  <th>Channel</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c._id} onClick={() => navigate(`/customers/${c._id}`)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="customer-avatar" style={{ width: 36, height: 36, fontSize: 13, margin: 0, border: 'none', boxShadow: 'none' }}>
                          {getInitials(c.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{c.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{c.city || '—'}</td>
                    <td>{c.totalOrders}</td>
                    <td>₹{(c.totalSpent || 0).toLocaleString()}</td>
                    <td>
                      {c.digitalTwin?.churnRisk && (
                        <span className={`tag ${getChurnColor(c.digitalTwin.churnRisk)}`}>
                          {c.digitalTwin.churnRisk}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="tag tag-purple">{c.digitalTwin?.preferredChannel || '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
            {Array.from({ length: Math.min(pagination.pages, 10) }).map((_, i) => (
              <button
                key={i}
                className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
