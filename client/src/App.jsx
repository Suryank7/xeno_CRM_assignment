import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Segments from './pages/Segments';
import Campaigns from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetail';
import Copilot from './pages/Copilot';
import Landing from './pages/Landing';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Dashboard Layout */}
        <Route
          path="/*"
          element={
            <div className="app-layout">
              <Sidebar />
              <main className="app-main">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/customers/:id" element={<CustomerDetail />} />
                  <Route path="/segments" element={<Segments />} />
                  <Route path="/campaigns" element={<Campaigns />} />
                  <Route path="/campaigns/:id" element={<CampaignDetail />} />
                  <Route path="/copilot" element={<Copilot />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
