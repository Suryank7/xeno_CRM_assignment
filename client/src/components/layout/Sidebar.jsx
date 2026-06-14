import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Layers, Megaphone,
  BotMessageSquare, Sparkles, LogOut, MessageSquare, Menu
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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (collapsed) {
      document.body.classList.add('sidebar-collapsed');
      document.documentElement.style.setProperty('--sidebar-width', '72px');
    } else {
      document.body.classList.remove('sidebar-collapsed');
      document.documentElement.style.setProperty('--sidebar-width', '260px');
    }
  }, [collapsed]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" style={{ justifyContent: collapsed ? 'center' : 'space-between' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="sidebar-logo-icon">
            <Sparkles size={20} />
          </div>
          {!collapsed && (
            <div>
              <div className="sidebar-logo-text">
                Xeno <span>Pulse</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: -2 }}>
                AI Growth Engine
              </div>
            </div>
          )}
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="btn-ghost btn-icon" 
          style={{ padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className="sidebar-nav" style={{ flex: 1, padding: collapsed ? '16px 8px' : '16px 12px' }}>
        {!collapsed && <div className="sidebar-section-label">Main</div>}
        {collapsed && <div style={{ height: 20 }}></div>}
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '12px' : '10px 12px' }}
            title={collapsed ? item.label : ''}
          >
            <item.icon size={20} />
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && item.badge && <span className="sidebar-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: collapsed ? '16px 8px' : '16px 12px', borderTop: '1px solid var(--border-light)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: collapsed ? '8px' : '12px 16px',
          background: 'var(--bg-primary)', borderRadius: 12, marginBottom: 16,
          border: '1px solid var(--border-light)', justifyContent: collapsed ? 'center' : 'flex-start'
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: 'var(--primary-100)', color: 'var(--primary-700)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 14
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.email || 'user@example.com'}
              </div>
            </div>
          )}
        </div>
        <button 
          onClick={handleLogout}
          title={collapsed ? "Logout" : ""}
          style={{ 
            width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: collapsed ? '12px' : '10px 16px', 
            background: 'transparent', border: 'none', color: '#EF4444', 
            cursor: 'pointer', borderRadius: '8px', fontWeight: 500,
            transition: '0.2s', justifyContent: collapsed ? 'center' : 'flex-start'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#FEF2F2'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
