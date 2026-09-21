FROM node:22-bookworm-slim AS base

# Install dependencies stage
FROM base AS dependencies
RUN apt-get update && apt-get upgrade -y && \
  apt-get install -y --no-install-recommends openssl ca-certificates && \
  rm -rf /var/lib/apt/lists/*
WORKDIR /app

RUN npm install -g prisma

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps --omit=dev && npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && \
  rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* tsconfig.json ./
COPY prisma ./prisma/
COPY src ./src/

RUN npm install --legacy-peer-deps
RUN npx prisma generate
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update && apt-get upgrade -y && \
  apt-get install -y --no-install-recommends openssl ca-certificates && \
  rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps --omit=dev --omit=optional && npm cache clean --force

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

COPY --from=builder /app/dist ./dist

RUN mkdir -p logs

RUN rm -rf \
  /usr/local/lib/node_modules/npm \
  /usr/local/lib/node_modules/corepack \
  /usr/local/bin/npm \
  /usr/local/bin/npx \
  /usr/local/bin/corepack \
  /root/.npm

RUN groupadd --system --gid 1001 nodejs && \
  useradd --system --uid 1001 --gid nodejs fastify
RUN chown -R fastify:nodejs /app/logs
USER fastify

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "dist/server.js"]
