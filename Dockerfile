# =============================================================================
# 🐳 Multi-stage Dockerfile — Stackra Frontend
# =============================================================================
#
# Builds the Vite app with all workspace packages in a minimal production image.
# Uses Caddy for static file serving with SPA fallback and compression.
#
# Build:
#   docker build -t stackra-inc-frontend .
#   docker build --build-arg APP_NAME=vite -t stackra-inc-frontend .
#
# Run:
#   docker run -p 8080:8080 stackra-inc-frontend
#
# =============================================================================

# ── Stage 1: Base ───────────────────────────────────────────────────────────
# Node.js 20 LTS Alpine with pnpm enabled via corepack.
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
ENV PNPM_HOME=/usr/local/bin

# ── Stage 2: Dependencies ──────────────────────────────────────────────────
# Install all workspace dependencies using the lockfile.
FROM base AS deps
WORKDIR /app

# Copy workspace config files first (Docker layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all package.json files for workspace resolution
COPY apps/vite/package.json ./apps/vite/
COPY packages/cache/package.json ./packages/cache/
COPY packages/config/package.json ./packages/config/
COPY packages/container/container/package.json ./packages/container/container/
COPY packages/container/application/package.json ./packages/container/application/
COPY packages/container/react/package.json ./packages/container/react/
COPY packages/desktop/package.json ./packages/desktop/
COPY packages/events/package.json ./packages/events/
COPY packages/kbd/package.json ./packages/kbd/
COPY packages/logger/package.json ./packages/logger/
COPY packages/multitenancy/package.json ./packages/multitenancy/
COPY packages/pwa/package.json ./packages/pwa/
COPY packages/redis/package.json ./packages/redis/
COPY packages/refine/package.json ./packages/refine/
COPY packages/rxdb-eloquent/package.json ./packages/rxdb-eloquent/
COPY packages/settings/package.json ./packages/settings/
COPY packages/support/package.json ./packages/support/
COPY packages/theming/package.json ./packages/theming/
COPY packages/ui/package.json ./packages/ui/

# Install all dependencies (including devDependencies for building)
RUN pnpm install --frozen-lockfile

# ── Stage 3: Builder ──────────────────────────────────────────────────────
# Build all packages and the target app.
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build packages first (turbo respects dependency order)
RUN pnpm turbo run build --filter='./packages/*'

# Build the target app
ARG APP_NAME=vite
RUN pnpm turbo run build --filter="./apps/${APP_NAME}"

# ── Stage 4: Production ──────────────────────────────────────────────────
# Minimal Caddy image serving the built static files.
FROM caddy:2-alpine AS runner

RUN addgroup -S app && adduser -S app -G app

# Copy the built Vite app
ARG APP_NAME=vite
COPY --from=builder /app/apps/${APP_NAME}/dist /srv

# Copy the production Caddyfile
COPY scripts/docker/Caddyfile.production /etc/caddy/Caddyfile

USER app
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
