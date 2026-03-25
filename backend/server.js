import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import connectDB from './config/db.js';
import usersRoutes from './routes/users.js';
import tournamentsRoutes from './routes/tournaments.js';
import participantsRoutes from './routes/participants.js';
import matchesRoutes from './routes/matches.js';
import bookingsRoutes from './routes/bookings.js';
import notificationsRoutes from './routes/notifications.js';
import settingsRoutes from './routes/settings.js';
import roomsRoutes from './routes/rooms.js';
import availabilityRoutes from './routes/availability.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'ArenaOPS backend' });
});

app.use('/api/users', usersRoutes);
app.use('/api/tournaments', tournamentsRoutes);
app.use('/api/participants', participantsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/availability', availabilityRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`ArenaOPS API running on http://localhost:${PORT}`);
  });
});
