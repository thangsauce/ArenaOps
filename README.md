# ArenaOPS

A full-featured tournament management platform built for university esports clubs. Manage tournaments, live matches, schedules, participants, room bookings, and notifications — all from one sleek interface.

**Live demo:** [https://thangsauce.github.io/ArenaOps/](https://thangsauce.github.io/ArenaOps/)

---

## Features

### Tournament Management
- Create and manage **single-elimination, double-elimination, round-robin, and swiss** brackets
- Per-tournament detail view with bracket visualization and match list
- Set default formats, max participants, and organizer name in Settings

### Dashboard
- Overview of active tournaments, live matches, upcoming matches, and key stats
- Quick-action cards and real-time status indicators

### Participants
- Manage player registrations with **confirmed, pending, and declined** status
- Filter, search, and sort by seed, name, or status
- Inline status editing and bulk invite modal
- Availability confirmation flow for registered players

### Schedule
- **Grid and list views** of match timelines
- Report delays directly from the schedule
- Configurable week start day and default view in Settings

### Live Control
- Real-time match management with score entry
- No-show reporting, delay handling, and room reassignment
- Live and delayed match highlighting

### Room Booking
- Assign venues to matches with time-slot management
- Prevent double-bookings with conflict detection
- Search and filter available locations

### Notifications
- In-app alerts for match start, delays, no-shows, and room changes
- Per-event toggle controls and optional sound alerts
- Unread badge on the sidebar notification icon

### Settings
- **Profile** — display name, email, university
- **Appearance** — dark/light/system theme, comfortable/compact density
- **Time & Timezone** — 12h/24h format with live preview, timezone selector
- **Notifications** — fine-grained toggle for each event type
- **Schedule Preferences** — default view and week start day
- **Participant Preferences** — default sort order, hide declined toggle
- **Tournament Defaults** — pre-fill format, max participants, organizer name

### Sidebar Search
- Global search across tournaments, participants, matches, rooms, notifications, and settings sections
- Keyboard-friendly with instant results dropdown

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Build Tool | [Vite](https://vitejs.dev/) |
| Routing | [React Router v7](https://reactrouter.com/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) + CSS Modules |
| Animation | [Framer Motion](https://www.framer.com/motion/) |
| Icons | [Lucide React](https://lucide.dev/) |
| State | React Context + custom hooks |

---

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

---

## Project Structure

```
src/
├── components/
│   └── layout/             # AppLayout, Sidebar (with global search)
├── data/
│   └── mockData.ts         # Mock tournament, match, and participant data
├── pages/                  # Route-level page components
│   ├── Dashboard.tsx
│   ├── Tournaments.tsx
│   ├── TournamentDetail.tsx
│   ├── Participants.tsx
│   ├── Schedule.tsx
│   ├── LiveControl.tsx
│   ├── RoomBooking.tsx
│   ├── Notifications.tsx
│   ├── Settings.tsx
│   ├── Landing.tsx
│   ├── Login.tsx / Register.tsx
│   └── AvailabilityConfirm.tsx
├── store/                  # React Context, state, hooks, settings types
├── types/                  # Shared TypeScript interfaces
└── utils/                  # Time formatting helpers
```

---

## Author

Thang Le — [github.com/thangsauce](https://github.com/thangsauce)
