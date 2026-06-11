import { Search } from 'lucide-react';

export default function Header({ title, subtitle, children }) {
  return (
    <header className="header">
      <div className="header-left">
        <div>
          <h1 className="header-title">{title}</h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="header-right">
        {children}
        <div className="header-search">
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search..." />
        </div>
      </div>
    </header>
  );
}
