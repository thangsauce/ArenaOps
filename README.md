# ArenaOPS

A full-featured tournament management platform built for university esports clubs. Manage tournaments, live matches, schedules, participants, room bookings, and notifications — all from one place.

**Live demo:** [https://thangsauce.github.io/ArenaOps/](https://thangsauce.github.io/ArenaOps/)

## Features

- **Dashboard** — Overview of active tournaments, live matches, and key stats
- **Tournament Management** — Create and manage single-elimination, double-elimination, round-robin, and swiss brackets
- **Participant Tracking** — Manage registrations, availability confirmations, and player status
- **Schedule** — Grid and list views of match timelines with delay reporting
- **Live Control** — Real-time match management with score entry, no-show reporting, and delay handling
- **Room Booking** — Assign venues, manage time slots, and prevent double-bookings
- **Notifications** — In-app alerts for match events, delays, no-shows, and room changes
- **Settings** — Profile, timezone, time format, appearance, notification preferences, and more

## Tech Stack

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [React Router v7](https://reactrouter.com/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide React](https://lucide.dev/)
- CSS Modules

## Getting Started

### Prerequisites

- Node.js 20+
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

Open [http://localhost:5173/ArenaOps/](http://localhost:5173/ArenaOps/) in your browser.

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
│   ├── layout/         # AppLayout, Sidebar
│   └── ThemeToggle.tsx # Dark/light mode toggle
├── data/
│   └── mockData.ts     # Mock tournament/match data
├── pages/              # Route-level page components
├── store/              # React Context, state, hooks
├── types/              # Shared TypeScript types
└── utils/              # Helper utilities (time formatting)
```

## Author

Thang Le — [github.com/thangsauce](https://github.com/thangsauce)
