<div align="center">

# 🍽️ VoteDine

### Real-time group dining platform for voting, chat, restaurant discovery, and decision-making

[![Next.js](https://img.shields.io/badge/Next.js-15.5.11-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.2.0-000000?style=for-the-badge&logo=fastify&logoColor=white)](https://fastify.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](docker-compose.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Features](#-features) • [Stack](#-stack) • [Quick Start](#-quick-start) • [Structure](#-project-structure) • [Scripts](#-scripts) • [License](#-license) • [Contact](#-contact)

</div>

---

## Table of Contents

- [About](#-about)
- [Features](#-features)
- [Stack](#-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Scripts](#-scripts)
- [License](#-license)
- [Contact](#-contact)

## About

VoteDine helps groups decide where to eat with live room voting, chat, restaurant discovery, calendar actions, and AI-assisted recommendations. The repo is split into a Next.js frontend, a Fastify backend, and shared deployment and database tooling.

## Features

- Room creation and guest-friendly join flow
- Yelp-backed restaurant discovery with database fallback
- Real-time votes and live chat over Socket.io
- AI recommendations tuned to group preference and budget
- Voice commands, analytics dashboards, sharing, and calendar actions
- PWA support, multi-language UI, and mobile-friendly layouts

## Stack

| Area | Technologies |
| --- | --- |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Fastify 5, Prisma, Socket.io, Zod, Winston |
| Data | PostgreSQL, Redis |
| Tooling | Docker Compose, Playwright, Vitest, npm workspaces |

## Quick Start

### Docker

```bash
npm run dev
```

### Local development

```bash
cp .env.example .env
npm run install:all
npm run dev:local
```

Open the app at `http://localhost:3000` and the backend at `http://localhost:3001`.

## Project Structure

```text
VoteDine/
├── frontend/          # Next.js app and UI components
├── backend/           # Fastify API, Prisma, and socket handlers
├── docs/              # Architecture and migration notes
├── docker-compose.yml # Full local stack
├── Makefile           # Convenience commands
└── setup.sh           # Environment bootstrap script
```

## Scripts

```bash
npm run dev
npm run dev:local
npm run build
npm run test
npm run test:e2e
npm run lint
npm run type-check
npm run db:migrate
npm run db:studio
```

## License

MIT. See [LICENSE](LICENSE) for details.

## Contact

- Website: [votedine.com](https://votedine.com)
- Repository: [mangeshraut712/VoteDine](https://github.com/mangeshraut712/VoteDine)
- Issues: open a GitHub issue in this repository
