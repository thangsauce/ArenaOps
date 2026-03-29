# Setup and Deployment

## Local Development

### Frontend

```bash
cd "/Users/thangle/School Projects/ArenaOps/frontend"
npm install
npm run dev
```

Open: <http://localhost:5173>

### Backend

```bash
cd "/Users/thangle/School Projects/ArenaOps/backend"
npm install
npm run dev
```

Backend default URL: <http://localhost:4000>

## Backend Environment

Create a `backend/.env` file with at least:

```bash
MONGO_URI=your_mongodb_connection_string
PORT=4000
```

The backend exits on startup if `MONGO_URI` is missing.

## Build

```bash
cd "/Users/thangle/School Projects/ArenaOps/frontend"
npm run build
```

Output goes to `frontend/dist/`.

## Lint

```bash
cd "/Users/thangle/School Projects/ArenaOps/frontend"
npm run lint
```

## Frontend Deployment

Frontend deployment is handled by GitHub Actions.

- Workflow file: `.github/workflows/static.yml`
- Trigger: push to `main`
- Node version in workflow: 22
- Build source: `frontend/`
- Deploy target: GitHub Pages

Live site: <https://thangsauce.github.io/ArenaOps/>

## Important Paths

- Repo root: `/Users/thangle/School Projects/ArenaOps`
- Frontend app: `/Users/thangle/School Projects/ArenaOps/frontend`
- Backend app: `/Users/thangle/School Projects/ArenaOps/backend`
- Obsidian notes: `/Users/thangle/Library/Mobile Documents/iCloud~md~obsidian/Documents/School Projects/ArenaOps`
