# VoteDine - Modern 2026 Architecture

## Overview

This is a comprehensive upgrade of the VoteDine application using cutting-edge 2026 web technologies. The application helps groups of people decide on restaurants through real-time voting and collaboration.

## Technology Stack

### Frontend (2026 Modern Stack)
- **Framework**: Next.js 16 with React 19
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS 3 with shadcn/ui components
- **State Management**: Zustand 5 + TanStack Query v5
- **Real-time**: Socket.io-client v4
- **Form Handling**: React Hook Form v7 + Zod validation
- **Build Tool**: Turbopack (Next.js native)
- **Testing**: Vitest + React Testing Library + Playwright

### Backend (2026 Modern Stack)
- **Runtime**: Node.js 22 with TypeScript
- **Framework**: Fastify 5 with plugins ecosystem
- **Database**: PostgreSQL 16 with Prisma ORM 6
- **Cache**: Redis 7
- **Real-time**: Socket.io 4
- **Authentication**: JWT with @fastify/jwt
- **API Documentation**: OpenAPI/Swagger with @fastify/swagger
- **Validation**: Zod schemas
- **Logging**: Winston 3
- **Testing**: Vitest + Supertest

### Infrastructure & DevOps
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes-ready
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Environment**: Multi-stage (dev/staging/prod)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   Next.js 16    │  │   Socket.io     │                  │
│  │   React 19      │  │   Client        │                  │
│  │   TypeScript    │  │                 │                  │
│  └────────┬────────┘  └────────┬────────┘                  │
└───────────┼────────────────────┼────────────────────────────┘
            │                    │
            │ HTTP/REST          │ WebSocket
            │                    │
┌───────────┼────────────────────┼────────────────────────────┐
│           │    API GATEWAY     │                            │
│  ┌────────▼────────────────────▼────────┐                   │
│  │         Fastify 5 Server            │                   │
│  │  ┌─────────────┐  ┌──────────────┐  │                   │
│  │  │   REST API  │  │  Socket.io   │  │                   │
│  │  │   Routes    │  │  Handlers    │  │                   │
│  │  └─────────────┘  └──────────────┘  │                   │
│  └─────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
            │
            │ Prisma ORM
            │
┌───────────▼────────────────────────────────────────────────┐
│                  DATA LAYER                                 │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   PostgreSQL    │  │     Redis       │                  │
│  │      16         │  │      7          │                  │
│  │  (Primary DB)   │  │  (Cache/Sessions)│                  │
│  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
votedine/
├── frontend/                    # Next.js 16 frontend
│   ├── app/                     # App router
│   │   ├── api/                 # API routes
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   ├── globals.css          # Global styles
│   │   └── providers.tsx        # Context providers
│   ├── components/
│   │   └── ui/                  # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── toaster.tsx
│   ├── lib/
│   │   └── utils.ts             # Utility functions
│   ├── hooks/                   # Custom React hooks
│   ├── store/                   # Zustand stores
│   ├── types/                   # TypeScript types
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── Dockerfile
│
├── backend/                     # Fastify backend
│   ├── src/
│   │   ├── server.ts            # Entry point
│   │   ├── routes/
│   │   │   ├── users.ts         # User routes
│   │   │   ├── rooms.ts         # Room routes
│   │   │   ├── restaurants.ts   # Restaurant routes
│   │   │   └── votes.ts         # Voting routes
│   │   ├── socket/
│   │   │   └── handlers.ts      # Socket.io handlers
│   │   ├── utils/
│   │   │   └── logger.ts        # Winston logger
│   │   └── types/               # Type definitions
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── docker-compose.yml           # Docker orchestration
├── .env.example                 # Environment variables
├── .github/
│   └── workflows/
│       ├── ci-cd.yml            # CI/CD pipeline
│       └── github-pages.yml     # GitHub Pages deploy
└── README.md                    # This file
```

## Database Schema

### Entities

**User**
- id: Int (PK)
- username: String (unique)
- password: String (hashed)
- createdAt: DateTime
- updatedAt: DateTime

**Restaurant**
- id: Int (PK)
- name: String (unique)
- yelpId: String (optional)
- address: String (optional)
- phone: String (optional)
- rating: Float (optional)
- reviewCount: Int (optional)
- imageUrl: String (optional)
- latitude: Float (optional)
- longitude: Float (optional)
- cuisine: String (optional)
- price: String (optional)

**Room**
- id: String (UUID, PK)
- code: String (8-char, unique)
- name: String
- cuisine: String (optional)
- priceRange: String (optional)
- latitude: Float (optional)
- longitude: Float (optional)
- radius: Int (optional)
- isActive: Boolean
- createdAt: DateTime
- updatedAt: DateTime

**Vote**
- id: Int (PK)
- userId: Int (FK)
- restaurantId: Int (FK)
- roomId: String (FK, optional)
- voteCount: Int
- createdAt: DateTime
- updatedAt: DateTime

**Message**
- id: Int (PK)
- roomId: String (FK)
- userId: Int (FK, optional)
- guestName: String (optional)
- content: String
- createdAt: DateTime

## Features

### Core Functionality
1. **User Authentication**
   - JWT-based authentication
   - Secure password hashing with bcrypt
   - Guest user support

2. **Room Management**
   - Create rooms with unique codes
   - Join rooms via code
   - Room preferences (cuisine, price, location)
   - Real-time member updates

3. **Restaurant Search**
   - Yelp API integration
   - Location-based search
   - Filter by cuisine, price, rating
   - Google Maps integration

4. **Voting System**
   - Real-time voting with Socket.io
   - Vote up/down restaurants
   - Live vote count updates
   - Leaderboard display

5. **Chat System**
   - Real-time messaging
   - User and guest messages
   - Message history

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user

### Rooms
- `POST /api/rooms` - Create room
- `GET /api/rooms/:code` - Get room details
- `POST /api/rooms/:code/join` - Join room
- `PATCH /api/rooms/:code/close` - Close room

### Restaurants
- `GET /api/restaurants/search` - Search restaurants
- `GET /api/restaurants/:id` - Get restaurant details

### Votes
- `POST /api/votes` - Cast vote
- `GET /api/votes/my-votes` - Get user's votes
- `GET /api/votes/room/:roomId` - Get room votes
- `GET /api/votes/leaderboard` - Get leaderboard

## Getting Started

### Prerequisites
- Node.js 22+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)
- Redis 7 (or use Docker)
- Yelp API key
- Google Maps API key

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd votedine
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Or run locally**
   
   Backend:
   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npm run dev
   ```
   
   Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Database Migrations

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
npx prisma studio  # Open Prisma Studio
```

## Deployment

### Production Deployment

1. **Build Docker images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Push to container registry**
   ```bash
   docker tag votedine_frontend:latest <registry>/frontend:latest
   docker tag votedine_backend:latest <registry>/backend:latest
   docker push <registry>/frontend:latest
   docker push <registry>/backend:latest
   ```

3. **Deploy to Kubernetes**
   ```bash
   kubectl apply -f k8s/
   ```

## Testing

### Frontend Tests
```bash
cd frontend
npm run test          # Unit tests with Vitest
npm run test:e2e      # E2E tests with Playwright
```

### Backend Tests
```bash
cd backend
npm run test          # Unit tests with Vitest
npm run test:coverage # Coverage report
```

## Performance Optimizations

### Frontend
- Next.js 16 with App Router for optimal SSR/SSG
- Turbopack for faster development builds
- Image optimization with next/image
- Code splitting and lazy loading
- React Server Components for reduced client JS

### Backend
- Fastify for high-performance HTTP handling
- Prisma connection pooling
- Redis caching for session data
- Socket.io Redis adapter for horizontal scaling
- Winston logging with rotation

### Database
- PostgreSQL 16 with query optimization
- Prisma ORM with query batching
- Database indexing on frequently queried fields
- Connection pooling

## Security Features

- JWT authentication with secure signing
- bcrypt password hashing (10+ rounds)
- Helmet.js security headers
- CORS configuration
- Input validation with Zod
- SQL injection prevention via Prisma
- XSS protection
- Rate limiting (to be implemented)

## Monitoring & Observability

- Winston structured logging
- Health check endpoints
- Docker health checks
- Prometheus metrics (ready for integration)
- Application performance monitoring (APM ready)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License

## Support

For support, email support@example.com or join our Discord server.

---

**Built with modern 2026 web technologies** 🚀
