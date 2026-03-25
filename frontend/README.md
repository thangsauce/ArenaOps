# ArenaOps — Tournament Management Platform

A full-featured tournament management SPA built for clubs and organizers running E-Sports, Sports, Board, and Card game competitions. Manage everything from registration through live match control in one interface.

---

## Features

### Landing Page

- Animated hero with scroll-triggered headline and scoreboard decode effects
- Category filter buttons for **E-Sports**, **Sports**, **Board**, and **Card** game tournaments
- 25 games across all four categories with branded cards
- Interactive animated background hinting at the four game types
- Per-character 3D flip animation on the "Everything your club needs" section
- Custom **AO monogram logo** (Bebas Neue, theme-aware) in navbar and footer

### Dashboard

- Overview of active tournaments, live matches, upcoming matches, and key stats
- Category tabs with Lucide icons (E-Sports / Sports / Board & Card)
- Quick-action stat cards with colored accents
- **Empty state** with create CTA when no tournaments exist
- **Welcome banner** — canvas fireworks animation on first visit with 3-step onboarding guide

### Tournament Management

- Create and manage **single-elimination, double-elimination, round-robin, and swiss** brackets
- Per-tournament detail view with bracket visualization and match list
- Set default formats, max participants, and organizer name in Settings

### Participants

- Manage player registrations with **confirmed, pending, and declined** status
- Filter, search, and sort by seed, name, or status
- Inline status editing and bulk invite modal
- Availability confirmation flow for registered players

### Schedule

- **Grid and list views** of match timelines
- Report delays directly from the schedule with **double-confirmation dialog**
- **Delay countdown timer** — counts down from selected delay duration, persists across navigation
- Resume match early via **confirmed Resume Now** action
- Status badge changes to **Delayed** during active delay

### Live Control

- Real-time match management with score entry
- No-show reporting and room reassignment
- **Delay handling** — pick a duration, confirm twice, countdown timer shown on card
- Resume match via confirmed dialog; timer persists across page navigation
- Mobile-friendly score inputs with accessible `aria-live` announcements

### Room Booking

- Assign venues to matches with time-slot management
- Prevent double-bookings with conflict detection
- Search and filter available locations

### Notifications

- **Toast notifications** — slide-in alerts for all key actions (create, update, delete, error)
- In-app alerts for match start, delays, no-shows, and room changes
- **Audio feedback** — programmatic two-tone chime via Web Audio API (no external file)
- **Time-grouped feed** — Today / Yesterday / Earlier sections
- Unread accent border on unseen notifications
- Performance bar chart (delivery rate, within-30s, read rate)
- Per-event toggle controls and sound on/off setting
- Unread badge on the sidebar notification icon

### Settings

- **Profile** — display name, email, organization name
- **Appearance** — dark / light / system theme, comfortable / compact density
- **Time & Timezone** — 12h/24h format with live preview, 13 timezone options
- **Notifications** — fine-grained toggle for each event type + sound toggle
- **Schedule Preferences** — default view and week start day
- **Participant Preferences** — default sort order, hide declined toggle
- **Tournament Defaults** — pre-fill format, max participants, organizer name

### Sidebar Search

- Global search across tournaments, participants, matches, rooms, notifications, and settings sections
- Keyboard-friendly with instant results dropdown

### Accessibility (HCI)

- **Skip to main content** link for keyboard users
- `aria-label` on all icon-only buttons
- `aria-live="polite"` regions for score changes and dynamic content
- `prefers-reduced-motion` fallback on the welcome banner fireworks
- Sufficient color contrast across dark and light themes

---

## Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Framework | [React 19](https://react.dev/) |
| Language  | [TypeScript](https://www.typescriptlang.org/) |
| Build     | [Vite](https://vitejs.dev/) |
| Routing   | [React Router v7](https://reactrouter.com/) |
| Styling   | [Tailwind CSS v4](https://tailwindcss.com/) + CSS Modules |
| Animation | [Framer Motion v12](https://www.framer.com/motion/) |
| Icons     | [Lucide React](https://lucide.dev/) |
| QR Codes  | [qrcode](https://github.com/soldair/node-qrcode) |
| State     | React Context + custom hooks  |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
cd frontend
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

### Deploy

```bash
npm run deploy    # Builds and pushes to GitHub Pages
```

---

## Project Structure

```text
frontend/
├── public/
│   └── favicon.svg             # Theme-aware AO monogram (dark/light)
├── src/
│   ├── assets/                 # Game logos and images
│   ├── components/
│   │   ├── BrandLogo.tsx       # Inline SVG AO logo (uses CSS theme vars)
│   │   ├── ConfirmDialog.tsx   # Reusable confirmation modal
│   │   ├── Toast.tsx           # Toast notification system
│   │   ├── WelcomeBanner.tsx   # First-visit onboarding banner w/ fireworks
│   │   └── layout/             # AppLayout, Sidebar, ShareModal
│   ├── data/                   # Mock tournament and participant data
│   ├── pages/                  # Route-level pages (15+)
│   ├── store/                  # React Context, state helpers, settings
│   ├── types/                  # Shared TypeScript type definitions
│   └── utils/                  # Date/time formatting utilities
└── package.json
```

---

## Author

Thang Le — [github.com/thangsauce](https://github.com/thangsauce)
