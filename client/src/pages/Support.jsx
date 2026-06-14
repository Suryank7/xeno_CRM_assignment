import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, CheckCircle, Search, AlertCircle } from 'lucide-react';
import Header from '../components/layout/Header';
import api from '../services/api';

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, open, in-progress, resolved, closed
  const [priorityFilter, setPriorityFilter] = useState('all'); // all, low, medium, high, urgent
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

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = statusFilter === 'all' ? true : t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' ? true : t.priority === priorityFilter;
    const matchesSearch = searchQuery === '' ? true : 
      (t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) || 
       t.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       t.customerId?.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <>
      <Header title="Support Inbox" subtitle="Manage customer inquiries and issues" />

      <div className="app-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', alignSelf: 'center', marginRight: 4 }}>Status:</span>
              <button className={`btn btn-sm ${statusFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatusFilter('all')}>All</button>
              <button className={`btn btn-sm ${statusFilter === 'open' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatusFilter('open')}>Open</button>
              <button className={`btn btn-sm ${statusFilter === 'in-progress' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatusFilter('in-progress')}>In Progress</button>
              <button className={`btn btn-sm ${statusFilter === 'resolved' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatusFilter('resolved')}>Resolved</button>
              <button className={`btn btn-sm ${statusFilter === 'closed' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setStatusFilter('closed')}>Closed</button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', alignSelf: 'center', marginRight: 4 }}>Priority:</span>
              <button className={`btn btn-sm ${priorityFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPriorityFilter('all')}>All</button>
              <button className={`btn btn-sm ${priorityFilter === 'urgent' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPriorityFilter('urgent')}>Urgent</button>
              <button className={`btn btn-sm ${priorityFilter === 'high' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPriorityFilter('high')}>High</button>
              <button className={`btn btn-sm ${priorityFilter === 'medium' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPriorityFilter('medium')}>Medium</button>
              <button className={`btn btn-sm ${priorityFilter === 'low' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPriorityFilter('low')}>Low</button>
            </div>
          </div>
          <div className="search-bar" style={{ alignSelf: 'flex-start' }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Search tickets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
