import { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({ title, subtitle, children }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSearch(e) {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/customers?search=${encodeURIComponent(query.trim())}`);
    }
  }

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
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>
    </header>
  );
}
