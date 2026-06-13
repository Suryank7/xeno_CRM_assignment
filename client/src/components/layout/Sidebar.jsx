import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Layers, Megaphone,
  BotMessageSquare, Sparkles, LogOut, Home, MessageSquare
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/segments', icon: Layers, label: 'Segments' },
  { to: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { to: '/copilot', icon: BotMessageSquare, label: 'AI Growth Agent', badge: 'AI' },
  { to: '/support', icon: MessageSquare, label: 'Support Inbox' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated'); // clear old stuff just in case
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Sparkles size={20} />
        </div>
        <div>
          <div className="sidebar-logo-text">
            Xeno <span>Pulse</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: -2 }}>
            AI Growth Engine
          </div>
        </div>
      </div>

      <nav className="sidebar-nav" style={{ flex: 1 }}>
        <div className="sidebar-section-label">Main</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
            {item.badge && <span className="sidebar-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border-light)' }}>
        {/* Dynamic User Profile */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
          background: 'var(--bg-primary)', borderRadius: 12, marginBottom: 16,
          border: '1px solid var(--border-light)'
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--primary-100)', color: 'var(--primary-700)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 14
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.email || 'user@example.com'}
            </div>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          style={{ 
            width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', 
            background: 'transparent', border: 'none', color: '#EF4444', 
            cursor: 'pointer', borderRadius: '8px', fontWeight: 500,
            marginBottom: '16px', transition: '0.2s', textAlign: 'left'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#FEF2F2'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={20} />
          Logout
        </button>

        <div style={{
          background: 'linear-gradient(135deg, var(--primary-50), var(--primary-100))',
          borderRadius: 12,
          padding: '16px',
          textAlign: 'center',
        }}>
          <Sparkles size={24} style={{ color: 'var(--primary-500)', margin: '0 auto 8px' }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary-700)' }}>
            AI-Powered
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
            Multi-Agent System Active
          </div>
        </div>
      </div>
    </aside>
  );
}
