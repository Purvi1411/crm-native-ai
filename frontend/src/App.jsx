import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login              from './pages/Login';
import Register           from './pages/Register';
import Dashboard          from './pages/Dashboard';
import Customers          from './pages/Customers';
import CampaignAgent      from './pages/CampaignAgent';
import Segments           from './pages/Segments';
import Campaigns          from './pages/Campaigns';
import LiveMonitor        from './pages/LiveMonitor';
import Analytics          from './pages/Analytics';
import ChurnIntelligence  from './pages/ChurnIntelligence';
import AICopilotPage      from './pages/AICopilotPage';
import Recommendations    from './pages/Recommendations';
import Settings           from './pages/Settings';
import OccasionsCalendar  from './pages/OccasionsCalendar';
import ForgotPassword       from './pages/ForgotPassword';
import ResetPassword        from './pages/ResetPassword';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/"         element={<Navigate to="/login" />} />

        {/* Auth */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Core */}
        <Route path="/dashboard"  element={<Dashboard />} />
        <Route path="/customers"  element={<Customers />} />
        <Route path="/segments"   element={<Segments />} />

        {/* Growth */}
        <Route path="/agent"      element={<CampaignAgent />} />
        <Route path="/campaigns"  element={<Campaigns />} />
        <Route path="/calendar"   element={<OccasionsCalendar />} />
        <Route path="/monitor"    element={<LiveMonitor />} />

        {/* Intelligence */}
        <Route path="/analytics"       element={<Analytics />} />
        <Route path="/churn"           element={<ChurnIntelligence />} />
        <Route path="/copilot"         element={<AICopilotPage />} />
        <Route path="/recommendations" element={<Recommendations />} />

        {/* System */}
        <Route path="/settings"   element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;
