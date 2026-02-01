FROM node:22-alpine AS base

# Install dependencies stage
FROM base AS dependencies
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install Prisma dependencies
RUN npm install -g prisma

COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Build stage
FROM base AS builder
WORKDIR /app

COPY package.json package-lock.json* tsconfig.json ./
COPY prisma ./prisma/
COPY src ./src/

RUN npm install
RUN npx prisma generate
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy built files
COPY --from=builder /app/dist ./dist

# Create logs directory
RUN mkdir -p logs

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify
RUN chown -R fastify:nodejs /app/logs
USER fastify

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "dist/server.js"]
