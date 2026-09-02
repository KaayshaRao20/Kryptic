import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { FraudDetection } from './pages/FraudDetection';
import { ExplainableAI } from './pages/ExplainableAI';
import TwinLab from './pages/TwinLab';
import { Payment } from './pages/Payment';
import { AlertsEmergency } from './pages/AlertsEmergency';
import { CrossSystemRisk } from './pages/CrossSystemRisk';
import { Connectors } from './pages/Connectors';
import { TwinProvider } from './features/twin/TwinContext';

function App() {
  return (
    <TwinProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
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
          <Route path="system/evaluation" element={<div className="p-4">Evaluation Placeholder</div>} />
          <Route path="system/datasets" element={<div className="p-4">Datasets Placeholder</div>} />
          <Route path="system/settings" element={<div className="p-4">Settings Placeholder</div>} />
        </Route>
      </Routes>
      </BrowserRouter>
    </TwinProvider>
  );
}

export default App;
