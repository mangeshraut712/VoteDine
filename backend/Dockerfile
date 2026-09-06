FROM node:22-alpine AS base

# Install dependencies stage
FROM base AS dependencies
# Upgrade system packages to fix security vulnerabilities
RUN apk update && apk upgrade --no-cache && \
  apk add --no-cache libc6-compat openssl
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

# Upgrade system packages to fix security vulnerabilities
RUN apk update && apk upgrade --no-cache

# Install only production dependencies
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --omit=optional && npm cache clean --force

# Use the client generated in the builder so the Prisma CLI (and
# deepmerge-ts) is not present in the runtime image.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copy built files
COPY --from=builder /app/dist ./dist

# Create logs directory
RUN mkdir -p logs

# Remove the Node-bundled npm CLI from the runtime image. It is not used by
# the Fastify process and Trivy otherwise reports CVEs in npm's nested deps.
RUN rm -rf \
  /usr/local/lib/node_modules/npm \
  /usr/local/lib/node_modules/corepack \
  /usr/local/bin/npm \
  /usr/local/bin/npx \
  /usr/local/bin/corepack \
  /root/.npm

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 fastify
RUN chown -R fastify:nodejs /app/logs
USER fastify

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "dist/server.js"]
