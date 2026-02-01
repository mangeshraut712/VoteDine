# VoteDine

VoteDine is a full-stack web app for groups that want to decide where to eat together. It combines a Next.js frontend with a Fastify API, real-time Socket.io updates, and a PostgreSQL database.

## Repository layout

- `frontend/` - Next.js 15 App Router UI
- `backend/` - Fastify 5 API server
- `docker-compose.yml` - Local Postgres, Redis, API, and UI
- `docs/` - Architecture notes and migration references

## What is implemented

- Room creation and join by 8-character code
- Restaurant search via Yelp (if `YELP_API_KEY` is set) with database fallback
- Real-time voting updates over Socket.io
- Analytics dashboard backed by database aggregates
- Recommendation endpoint with rule-based ranking
- Calendar events stored in the database
- Swagger/OpenAPI docs at `http://localhost:3001/docs`

## What is scaffolded or mocked

- Voice command processing is mocked on the backend. The UI uses browser speech recognition only.
- Social share analytics, QR generation, and short links return mock data.
- Auth endpoints exist (register/login/JWT) but the login/register UI is not wired yet.
- Redis is provisioned in Docker but not used in code.
- Playwright is listed as a dependency but no config is checked in.

## Quick start (Docker)

1) Copy env template

```bash
cp .env.example .env
```

2) Update API keys and secrets in `.env`

3) Start the stack

```bash
docker-compose up -d
```

4) Open

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- API docs: `http://localhost:3001/docs`

## Local development (no full Docker stack)

```bash
# Start databases only
make db-up

# Install deps (root, frontend, backend)
make install

# Run migrations
cd backend && npm run db:migrate

# Optionally seed sample data
cd backend && npm run db:seed

# Run backend and frontend in separate terminals
cd backend && npm run dev
cd frontend && npm run dev
```

## Environment variables

See `.env.example` for the full list. Common variables:

```
DATABASE_URL=postgresql://postgres:password@localhost:5432/votedine?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-me
YELP_API_KEY=your-yelp-api-key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
PORT=3001
HOST=0.0.0.0
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Useful scripts

Root (from `package.json`):

```bash
npm run dev            # docker-compose up -d
npm run dev:local      # run backend/frontend locally
npm run build          # build backend + frontend
npm run lint           # lint both apps
npm run type-check     # typecheck both apps
npm run test           # run backend + frontend tests
npm run test:e2e       # run Playwright (config needed)
```

Makefile helpers:

```bash
make dev
make dev-local
make db-up
make db-migrate
make test
```

## API overview

The API is mounted under `/api` and documented in Swagger at `/docs`. Key routes include:

- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/rooms/:code`
- `POST /api/rooms`
- `GET /api/restaurants/search`
- `POST /api/votes`
- `GET /api/analytics/overview`
- `GET /api/recommendations`
- `GET /api/calendar/events`

Socket.io events are handled in `backend/src/socket/handlers.ts`.

## Notes

- The frontend uses Next.js 15 with Tailwind CSS 3 and Radix UI primitives.
- Docker builds use Next.js standalone output (`output: 'standalone'`).

## Contributing

1) Create a feature branch
2) Make your changes
3) Run `make lint` and `make test`
4) Open a pull request
