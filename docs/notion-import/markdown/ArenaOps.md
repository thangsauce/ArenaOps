# ArenaOps

ArenaOps is a tournament operations platform for organizers running E-Sports, sports, board games, and card game events.

## Purpose

ArenaOps gives organizers one place to manage tournament setup, participants, scheduling, live match control, room booking, notifications, and settings.

## Current State

- Frontend SPA is implemented in `frontend/`
- Backend API is implemented in `backend/` with Express + MongoDB/Mongoose
- Frontend still uses local mock data in `frontend/src/data/mockData.ts`
- GitHub Pages deployment is configured for the frontend
- The app supports 25+ games across four categories

## Repo Layout

```text
ArenaOps/
  .github/workflows/   GitHub Actions workflow for frontend Pages deployment
  frontend/            Vite + React application
  backend/             Express + Mongoose API server
```

## Main Notes

- [Project Overview](Project%20Overview.md)
- [Features](Features.md)
- [Tech Stack](Tech%20Stack.md)
- [Backend Plan](Backend%20Plan.md)
- [Setup and Deployment](Setup%20and%20Deployment.md)
- [Todo](../todo.csv)

## Tech Snapshot

- React 19
- TypeScript
- Vite
- React Router v7
- Tailwind CSS v4
- CSS Modules
- Framer Motion
- Express
- MongoDB / Mongoose

## Quick Start

### Frontend

```bash
cd "/Users/thangle/School Projects/ArenaOps/frontend"
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

### Backend

```bash
cd "/Users/thangle/School Projects/ArenaOps/backend"
npm install
npm run dev
```

Backend URL: `http://localhost:4000`

## Live Demo

<https://thangsauce.github.io/ArenaOps/>
