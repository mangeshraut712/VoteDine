# Contributing to VoteDine

Thanks for helping improve VoteDine.

## Setup

Requires Node.js 22+ and Docker (for the full local stack).

```bash
npm run install:all
# or
./setup.sh
```

Copy `.env.example` to `.env` and fill in any API keys you need.

## Checks before a PR

```bash
npm test
npm run lint
npm run type-check
```

Frontend and backend each use Vitest. Prefer small focused changes with a clear description of what broke and how you verified the fix.
