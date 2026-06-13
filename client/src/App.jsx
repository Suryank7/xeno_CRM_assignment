import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import Segments from './pages/Segments';
import Campaigns from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetail';
import Copilot from './pages/Copilot';
import Support from './pages/Support';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Payment from './pages/Payment';
import Contact from './pages/Contact';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Ancillary Pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/contact" element={<Contact />} />

        {/* Protected Payment Page */}
        <Route path="/payment" element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } />

        {/* Dashboard Layout (Protected) */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="app-layout page-fade-in">
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
                    <Route path="/support" element={<Support />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
