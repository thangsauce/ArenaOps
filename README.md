# ArenaOps

Tournament management platform for every sport and game — from E-Sports and athletics to board games and card tournaments. Run brackets, live matches, schedules, participant registration, room bookings, and notifications all from one interface.

**Live demo:** [https://thangsauce.github.io/ArenaOps/](https://thangsauce.github.io/ArenaOps/)

![ArenaOpsThumnailRecordingGif](https://github.com/user-attachments/assets/6be9f7b0-202b-4d08-b436-1ace75065734)

## Features

- **Multi-category support** — E-Sports, Sports, Board, and Card game tournaments with 25+ games
- **Bracket formats** — Single/double-elimination, round-robin, and swiss
- **Live Control** — Real-time score entry, no-show reporting, and delay handling with countdown timers
- **Scheduling** — Grid and list views with player availability confirmation flow and delay management
- **Room Booking** — Assign venues to matches with double-booking conflict detection
- **Notifications** — Toast alerts, sound feedback (Web Audio API), time-grouped feed, and per-event toggles
- **Dark / light theme** — System-aware with comfortable and compact density modes
- **Global search** — Instant results across tournaments, participants, rooms, and settings
- **Accessibility** — Keyboard navigation, ARIA labels, skip-to-content link, and reduced-motion support
- **Welcome banner** — Animated fireworks onboarding for first-time users

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
pnpm install
pnpm run dev          # http://localhost:5173
```

## Scripts

| Command           | Description                   |
|-------------------|-------------------------------|
| `pnpm run dev`     | Start local dev server        |
| `pnpm run build`   | Type-check + production build |
| `pnpm run lint`    | Run ESLint                    |
| `pnpm run deploy`  | Build + push to GitHub Pages  |

## Author

Thang Le — [github.com/thangsauce](https://github.com/thangsauce)
