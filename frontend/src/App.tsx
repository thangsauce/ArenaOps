import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import CreateTournament from './pages/CreateTournament';
import Participants from './pages/Participants';
import Schedule from './pages/Schedule';
import Notifications from './pages/Notifications';
import RoomBooking from './pages/RoomBooking';
import LiveControl from './pages/LiveControl';
import AvailabilityConfirm from './pages/AvailabilityConfirm';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter basename="/ArenaOps">
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Standalone confirmation link */}
        <Route path="/confirm/:token" element={<AvailabilityConfirm />} />

        {/* App pages (with sidebar layout) */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/:id" element={<TournamentDetail />} />
          <Route path="/create" element={<CreateTournament />} />
          <Route path="/participants" element={<Participants />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/live" element={<LiveControl />} />
          <Route path="/rooms" element={<RoomBooking />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
