import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Toast from './components/Toast';
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
      <Toast />
      <Routes>
        <Route path="/confirm/:token" element={<AvailabilityConfirm />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
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
      </Routes>
    </BrowserRouter>
  );
}
