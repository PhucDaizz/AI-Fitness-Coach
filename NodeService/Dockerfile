# ──────────────────────────────────────────────
# Stage 1: Builder
# ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (layer cache optimization)
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (including devDependencies for tsc)
RUN npm ci

# Copy source code
COPY src/ ./src/

# Compile TypeScript → JavaScript
RUN npm run build

# ──────────────────────────────────────────────
# Stage 2: Runner (production image)
# ──────────────────────────────────────────────
FROM node:20-alpine AS runner

# Add non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only production deps manifest
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Own files by non-root user
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000

# Healthcheck — /health endpoint defined in app.ts
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]