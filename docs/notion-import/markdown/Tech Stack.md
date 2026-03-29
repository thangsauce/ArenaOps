# Tech Stack

## Frontend

| Technology | Version | Role |
| --- | --- | --- |
| React | 19 | UI framework |
| TypeScript | ~5.9 | Type safety |
| Vite | 7 | Build tool and dev server |
| React Router | v7 | Client-side routing |
| Tailwind CSS | v4 | Utility styling and theme tokens |
| CSS Modules | - | Scoped page and component styles |
| Framer Motion | v12 | Motion and scroll-triggered animation |
| Lucide React | latest | Icon system |
| qrcode | 1.5 | QR generation for tournament sharing |
| Web Audio API | browser-native | Notification chime |

## Backend

| Technology | Version | Role |
| --- | --- | --- |
| Node.js | current runtime | Server runtime |
| Express | 4.18 | API framework |
| Mongoose | 8 | MongoDB ODM |
| MongoDB | external service | Persistent data store |
| dotenv | 16 | Environment loading |
| cors | 2.8 | Cross-origin support |

## State Management

- React Context via `AppContext`
- Custom hook access through `useApp`
- Local settings state in `frontend/src/store/settings.ts`
- Mock app data currently stored in `frontend/src/data/mockData.ts`

## Tooling

- ESLint
- TypeScript compiler (`tsc -b`)
- npm
- GitHub Actions

## Deployment

- GitHub Pages for the frontend
- GitHub Actions workflow at `.github/workflows/static.yml`
- Backend deployment target still needs to be chosen
