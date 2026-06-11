import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Layers, Megaphone,
  BotMessageSquare, Sparkles,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/segments', icon: Layers, label: 'Segments' },
  { to: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { to: '/copilot', icon: BotMessageSquare, label: 'AI Growth Agent', badge: 'AI' },
];

export default function Sidebar() {
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

      <nav className="sidebar-nav">
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
