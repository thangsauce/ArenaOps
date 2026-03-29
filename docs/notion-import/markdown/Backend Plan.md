# Backend Plan

## Current Backend Status

ArenaOps already has a backend scaffold in `backend/`.

### Stack

- Node.js
- Express
- MongoDB
- Mongoose
- dotenv
- cors

### Entry Points

- `backend/server.js` is the current main server entry
- `backend/src/index.js` is an older alternate server file and looks redundant

### Current API Surface

- `GET /api/health`
- `POST /api/users`
- `POST /api/tournaments`
- `GET /api/tournaments`
- `POST /api/participants`
- `POST /api/matches`
- `GET /api/matches/:id`
- `POST /api/bookings`
- `POST /api/notifications`
- `GET /api/notifications/:userId`
- `GET /api/settings/:userId`
- `PATCH /api/settings/:userId`
- `POST /api/rooms`
- `GET /api/rooms`
- `POST /api/availability`

### What It Already Handles

- MongoDB connection via `MONGO_URI`
- Basic CRUD-style route/controller separation
- Room booking conflict detection for overlapping time windows
- User settings read/update flow
- Notification retrieval by user
- Tournament and room listing endpoints

## Remaining Backend Work

- Add authentication and authorization
- Validate request payloads more rigorously
- Add update/delete endpoints where needed
- Add tests for routes, controllers, and booking conflict logic
- Standardize error responses
- Remove or merge the redundant `backend/src/index.js`
- Define production deployment target and environment setup

## Frontend Integration Work

- Replace `frontend/src/data/mockData.ts` with API calls
- Add loading, error, and empty states around server-backed data
- Introduce API client utilities and environment-based backend URL config
- Decide which frontend flows should remain optimistic vs server-confirmed

## Suggested Next Milestones

1. Add auth and a stable user model flow.
2. Connect tournaments, participants, and settings screens to the API.
3. Add backend validation and tests before expanding the endpoint surface.
4. Deploy the backend and switch the frontend to environment-based API URLs.
