# 🍽️ VoteDine

> VoteDine is a modern, real-time group dining platform built with 2026 web technologies

<div align="center">

![VoteDine](https://img.shields.io/badge/Next.js-15.5.11-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-5.2.0-000000?style=for-the-badge&logo=fastify&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-24.0.7-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)

</div>

## 🎯 Overview

Help your friends and family decide where to eat! This application revolutionizes group restaurant decision-making with real-time voting, live chat, and intelligent restaurant discovery. Built with cutting-edge 2026 technologies for maximum performance and scalability.

## ✨ Key Features

### 🏠 Room Management
- **Instant Room Creation**: Generate unique room codes in seconds
- **Guest Support**: Join without registration
- **Room Preferences**: Set cuisine, price range, and location filters
- **Persistent Sessions**: Keep rooms active until closed

### 🔍 Restaurant Discovery
- **Yelp Integration**: Access millions of restaurants with real data
- **Smart Filtering**: Filter by cuisine, price, rating, and location
- **Google Maps**: Visual restaurant locations and directions
- **Search Suggestions**: AI-powered restaurant recommendations

### 🤖 AI Recommendations
- **VoteDine AI**: Personalized picks tuned to group vibe and budget
- **Preference Learning**: Learns from past votes and cuisines
- **Confidence Scoring**: See why each pick matches the group

### 🎙️ Voice Commands
- **Hands-Free Control**: Create rooms, search cuisines, and view analytics by voice
- **Live Transcripts**: See recognized commands in real time

### 📅 Calendar Integration
- **One-Click Add**: Export winning restaurants to Google, Apple, or Outlook calendars
- **Event Templates**: Auto-fill time, location, and attendee notes

### 📊 Analytics Dashboard
- **Voting Insights**: Track top cuisines, active rooms, and vote momentum
- **Trend Lines**: Visualize vote spikes across the week

### 🔗 Social Sharing
- **Share Links**: Invite friends with a single tap
- **Native Share**: Use device share sheets for faster invites

### 📱 Offline & Mobile
- **PWA Ready**: Offline-first support with installable web app
- **Mobile App Scaffold**: React Native structure included for iOS and Android
- **Multi-Language UI**: English, Spanish, and French built in

### ⭐ Real-Time Voting
- **Live Vote Updates**: See votes appear instantly across all devices
- **Vote Analytics**: Real-time voting statistics and leaderboards
- **Vote History**: Track voting patterns and preferences
- **Anonymous Options**: Vote as guest or authenticated user

### 💬 Live Chat
- **Room Chat**: Discuss restaurant options with your group
- **Real-Time Messaging**: Instant message delivery
- **User Identification**: See who's saying what
- **Message History**: Keep chat logs for reference

### 🔐 Modern Authentication
- **JWT Security**: Secure, stateless authentication
- **Social Login Ready**: Easy integration with OAuth providers
- **Guest Access**: Full functionality without registration
- **Profile Management**: Save preferences and voting history

## 🏗️ Repository Layout

- `frontend/` - Next.js 15 App Router UI
- `backend/` - Fastify 5 API server
- `docker-compose.yml` - Local Postgres, Redis, API, and UI
- `docs/` - Architecture notes and migration references

## 🚀 What is Implemented

- Room creation and join by 8-character code
- Restaurant search via Yelp (if `YELP_API_KEY` is set) with database fallback
- Real-time voting updates over Socket.io
- Analytics dashboard backed by database aggregates
- Recommendation endpoint with rule-based ranking
- Calendar events stored in database
- Swagger/OpenAPI docs at `http://localhost:3001/docs`

## 🔒️ Security Features

- **Rate Limiting**: 100 requests per minute per IP
- **Security Headers**: 
  - X-Frame-Options: DENY (clickjacking protection)
  - Content-Security-Policy: frame-ancestors 'none'
  - X-Content-Type-Options: nosniff
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: geolocation=(), microphone=(), camera=()
  - Strict-Transport-Security (HSTS) in production
- **Environment Validation**: Zod schema validation at startup
- **Error Handling**: Comprehensive error handler with Zod, JWT, rate limit, and Prisma error support
- **Request Logging**: Automatic logging with slow request detection (>1s)
- **Health Check**: Database connectivity status

## 🚀 Quick Start (Docker)

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

## 💻 Local Development (no full Docker stack)

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

## 🔧 Environment Variables

See `.env.example` for the full list. Common variables:

```env
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

## 🛠️ Useful Scripts

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

## 📚 API Overview

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

## 📝 Notes

- The frontend uses Next.js 15 with Tailwind CSS 3 and Radix UI primitives.
- Docker builds use Next.js standalone output (`output: 'standalone'`).
- Rate limiting is configured at 100 requests per minute per IP.
- All errors are logged with request context (method, URL, IP, user-agent).
- Slow requests (>1s) trigger warning logs.

## 🤝 Contributing

1) Create a feature branch
2) Make your changes
3) Run `make lint` and `make test`
4) Open a pull request
