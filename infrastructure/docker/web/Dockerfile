# =============================================================================
# Multi-Tenant LMS — Web Frontend — Production Dockerfile
# Next.js 16 | Standalone output | Non-root | Minimal image
# =============================================================================

# ── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app
COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci

# ── Stage 2: Builder ─────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app
COPY apps/web/ .
COPY --from=deps /app/node_modules ./node_modules

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ── Stage 3: Runtime ─────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime

LABEL maintainer="LMS Platform Team"
LABEL description="Multi-Tenant LMS Web — Production Runtime"

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Non-root user
RUN addgroup -S lmsweb && adduser -S lmsweb -G lmsweb

WORKDIR /app

# Copy standalone Next.js output
COPY --from=builder --chown=lmsweb:lmsweb /app/.next/standalone ./
COPY --from=builder --chown=lmsweb:lmsweb /app/.next/static ./.next/static
COPY --from=builder --chown=lmsweb:lmsweb /app/public ./public

USER lmsweb

EXPOSE 3000

CMD ["node", "server.js"]
