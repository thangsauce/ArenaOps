# ArenaOPS

Tournament management platform for every sport and game — from E-Sports and athletics to board games and card tournaments. Run brackets, live matches, schedules, participant registration, room bookings, and notifications all from one interface.

**Live demo:** [https://thangsauce.github.io/ArenaOps/](https://thangsauce.github.io/ArenaOps/)

## Features

- **Multi-category support** — E-Sports, Sports, Board, and Card game tournaments with 25+ games
- **Bracket formats** — Single/double-elimination, round-robin, and swiss
- **Live Control** — Real-time score entry, no-show reporting, and delay handling
- **Scheduling** — Grid and list views with player availability confirmation flow
- **Room Booking** — Assign venues to matches with double-booking conflict detection
- **Notifications** — Sound alerts (Web Audio API), time-grouped feed, and per-event toggles
- **Dark / light theme** — System-aware with comfortable and compact density modes
- **Global search** — Instant results across tournaments, participants, rooms, and settings

## Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Framework | React 19                      |
| Language  | TypeScript                    |
| Build     | Vite                          |
| Routing   | React Router v7               |
| Styling   | Tailwind CSS v4 + CSS Modules |
| Animation | Framer Motion v12             |
| Icons     | Lucide React                  |
| QR Codes  | qrcode                        |

## Repository Layout

```text
ArenaOps/
  .github/workflows/   CI/CD — deploys frontend to GitHub Pages
  frontend/            Vite + React SPA (main application)
  backend/             Placeholder (not yet implemented)
```

## Quick Start

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

## Scripts

| Command           | Description                   |
|-------------------|-------------------------------|
| `npm run dev`     | Start local dev server        |
| `npm run build`   | Type-check + production build |
| `npm run lint`    | Run ESLint                    |
| `npm run deploy`  | Build + push to GitHub Pages  |

## Author

Thang Le — [github.com/thangsauce](https://github.com/thangsauce)
