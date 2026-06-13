import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, CheckCircle, Search, AlertCircle } from 'lucide-react';
import Header from '../components/layout/Header';
import api from '../services/api';

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, open, resolved
  const navigate = useNavigate();

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  const filteredTickets = tickets.filter(t => filter === 'all' ? true : t.status === filter);

  return (
    <>
      <Header title="Support Inbox" subtitle="Manage customer inquiries and issues" />

      <div className="app-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('all')}>All Tickets</button>
            <button className={`btn ${filter === 'open' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('open')}>Open</button>
            <button className={`btn ${filter === 'resolved' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('resolved')}>Resolved</button>
          </div>
          <div className="search-bar">
            <Search size={18} color="var(--text-muted)" />
            <input type="text" placeholder="Search tickets..." />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
        ) : (
          <div className="card animate-slide-up">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Customer</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map(ticket => (
                  <tr key={ticket._id}>
                    <td style={{ fontWeight: 600 }}>{ticket.ticketNumber}</td>
                    <td>
                      <div>{ticket.customerId?.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ticket.customerId?.email}</div>
                    </td>
                    <td>{ticket.subject}</td>
                    <td>
                      <span className={`status-badge status-${ticket.status === 'open' ? 'sending' : ticket.status === 'resolved' ? 'completed' : 'draft'}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td>
                      <span className={`tag tag-${ticket.priority === 'high' ? 'red' : ticket.priority === 'urgent' ? 'orange' : 'gray'}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td>{new Date(ticket.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/customers/${ticket.customerId?._id}`)}>
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTickets.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                      No tickets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
