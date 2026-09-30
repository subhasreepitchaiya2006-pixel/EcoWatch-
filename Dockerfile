# =========================================================
# Multi-stage Production Dockerfile for EcoWatch Intelligence
# =========================================================

# Stage 1: Build Frontend Assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package definitions and install all dependencies
COPY ecowatch-app/package*.json ./
RUN npm ci

# Copy source tree and compile Vite production bundle
COPY ecowatch-app/ ./
RUN npm run build

# Stage 2: Minimal Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy package files and install only production dependencies
COPY ecowatch-app/package*.json ./
RUN npm ci --only=production

# Copy compiled static frontend bundle
COPY --from=builder /app/dist ./dist

# Copy backend server, Mongoose models, and fallback database store
COPY ecowatch-app/server ./server

# Expose standard unified application port
EXPOSE 3001

# Healthcheck to ensure container availability
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start the unified Express server serving both REST API and Vite SPA
CMD ["node", "server/index.js"]
