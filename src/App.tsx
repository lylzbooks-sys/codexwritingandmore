import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, GuestRoute } from './components/RouteGuards';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import WriterDashboard from './pages/dashboards/WriterDashboard';
import ReaderDashboard from './pages/dashboards/ReaderDashboard';
import ArtistDashboard from './pages/dashboards/ArtistDashboard';
import HybridDashboard from './pages/dashboards/HybridDashboard';
import Storyboard from './pages/Storyboard';

function DashboardRouter() {
  return (
    <Routes>
      <Route path="writer" element={<WriterDashboard />} />
      <Route path="reader" element={<ReaderDashboard />} />
      <Route path="artist" element={<ArtistDashboard />} />
      <Route path="hybrid" element={<HybridDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />

          {/* Auth-required */}
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/dashboard/*" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
          <Route path="/storyboard" element={<ProtectedRoute><Storyboard /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
