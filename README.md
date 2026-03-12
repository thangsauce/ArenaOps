# ArenaOps 🏆

A tournament management dashboard built with React, TypeScript, and Vite. Manage tournaments, schedules, participants, room bookings, and live match control — all from one place.

## Features

- **Dashboard** — Overview of active tournaments and key stats
- **Tournament Management** — Create, view, and manage tournaments
- **Participant Tracking** — Manage registrations and availability confirmations
- **Schedule** — View and manage match schedules
- **Live Control** — Real-time match management panel
- **Room Booking** — Assign and track venue/room allocations
- **Notifications** — In-app alerts for match events and updates
- **Settings** — Timezone, time format, appearance, and notification preferences

## Tech Stack

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [React Router v7](https://reactrouter.com/)
- [Lucide React](https://lucide.dev/)
- CSS Modules

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/thangsauce/ArenaOps.git
cd ArenaOps
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── components/
│   └── layout/         # AppLayout, Sidebar
├── data/
│   └── mockData.ts     # Mock tournament/match data
├── pages/              # Route-level page components
├── store/              # Context, state, hooks
├── types/              # Shared TypeScript types
└── utils/              # Helper utilities
```

## License

MIT
