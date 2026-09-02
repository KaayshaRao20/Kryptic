import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { CustomerProvider } from './context/CustomerContext';
import { TwinProvider } from './features/twin/TwinContext';

// Admin Portal Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminAlerts } from './pages/admin/AdminAlerts';
import { AdminReports } from './pages/admin/AdminReports';

// Existing Customer View Pages (Reused without modification)
import { Dashboard } from './pages/Dashboard';
import { FraudDetection } from './pages/FraudDetection';
import { ExplainableAI } from './pages/ExplainableAI';
import TwinLab from './pages/TwinLab';
import { Payment } from './pages/Payment';
import { AlertsEmergency } from './pages/AlertsEmergency';
import { CrossSystemRisk } from './pages/CrossSystemRisk';
import { Connectors } from './pages/Connectors';

function App() {
  return (
    <TwinProvider>
      <BrowserRouter>
        <CustomerProvider>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              {/* Default landing opens the Admin Portal */}
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="admin/alerts" element={<AdminAlerts />} />
              <Route path="admin/reports" element={<AdminReports />} />

              {/* Customer View Routes (Isolated per Customer ID) */}
              <Route path="customer/:customerId/dashboard" element={<Dashboard />} />
              <Route path="customer/:customerId/payments" element={<Payment />} />
              <Route path="customer/:customerId/twin" element={<TwinLab />} />
              <Route path="customer/:customerId/lab" element={<TwinLab />} />
              <Route path="customer/:customerId/cross-system" element={<CrossSystemRisk />} />
              <Route path="customer/:customerId/alerts" element={<AlertsEmergency />} />
              <Route path="customer/:customerId/explain" element={<ExplainableAI />} />
              <Route path="customer/:customerId/detection" element={<FraudDetection />} />

              {/* Preserved Direct Routes for Full Backward Compatibility */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="intelligence/detection" element={<FraudDetection />} />
              <Route path="intelligence/explain" element={<ExplainableAI />} />
              <Route path="payments" element={<Payment />} />
              <Route path="infrastructure/twin" element={<TwinLab />} />
              <Route path="infrastructure/lab" element={<TwinLab />} />
              <Route path="twin" element={<TwinLab />} />
              <Route path="alerts" element={<AlertsEmergency />} />
              <Route path="cross-system" element={<CrossSystemRisk />} />
              <Route path="connectors" element={<Connectors />} />
              <Route path="system/evaluation" element={<AdminReports />} />
              <Route path="system/datasets" element={<AdminReports />} />
              <Route path="system/settings" element={<Connectors />} />
            </Route>
          </Routes>
        </CustomerProvider>
      </BrowserRouter>
    </TwinProvider>
  );
}

export default App;
