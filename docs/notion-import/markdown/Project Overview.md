# Project Overview

ArenaOps is a tournament management platform built for organizers running competitions across multiple categories, including E-Sports, traditional sports, board games, and card games.

## Core Goal

Provide a single system for tournament setup, registration, live match operations, scheduling, room management, notifications, and organizer settings.

## Current State

- Frontend app is implemented and deployed to GitHub Pages
- Backend API exists with Express, Mongoose, and MongoDB connection support
- Frontend is still powered by mock data and has not been fully wired to the API yet
- GitHub Actions deploys the frontend on pushes to `main`
- The product currently covers 25+ games across four categories

## Architecture Snapshot

```text
ArenaOps/
  frontend/   React + TypeScript SPA
  backend/    Express API with route/controller/model structure
```

## Current Backend Coverage

- Health check route
- Users
- Tournaments
- Participants
- Matches
- Bookings
- Notifications
- Settings
- Rooms
- Availability

## Biggest Remaining Gap

The main unfinished integration is connecting the frontend UI to the backend API so tournament data, participants, notifications, and settings are persisted instead of coming from `mockData.ts`.

## Author

Thang Le
GitHub: <https://github.com/thangsauce>
