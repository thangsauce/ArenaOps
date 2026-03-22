import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';

const Landing            = lazy(() => import('./pages/Landing'));
const Login              = lazy(() => import('./pages/Login'));
const Register           = lazy(() => import('./pages/Register'));
const Dashboard          = lazy(() => import('./pages/Dashboard'));
const Tournaments        = lazy(() => import('./pages/Tournaments'));
const TournamentDetail   = lazy(() => import('./pages/TournamentDetail'));
const CreateTournament   = lazy(() => import('./pages/CreateTournament'));
const Participants       = lazy(() => import('./pages/Participants'));
const Schedule           = lazy(() => import('./pages/Schedule'));
const Notifications      = lazy(() => import('./pages/Notifications'));
const RoomBooking        = lazy(() => import('./pages/RoomBooking'));
const LiveControl        = lazy(() => import('./pages/LiveControl'));
const AvailabilityConfirm = lazy(() => import('./pages/AvailabilityConfirm'));
const Settings           = lazy(() => import('./pages/Settings'));

export default function App() {
  return (
    <BrowserRouter basename="/ArenaOps">
      <Suspense>
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
      </Suspense>
    </BrowserRouter>
  );
}
