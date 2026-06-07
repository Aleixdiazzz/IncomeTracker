# syntax=docker/dockerfile:1

# ---- deps: install all dependencies (incl. dev, needed for build + migrate) ----
FROM node:22-alpine AS deps
WORKDIR /app
# libc compat for some native deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: compile the Next.js standalone output ----
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# next.config.ts has output: "standalone"
ENV NEXT_TELEMETRY_DISABLED=1
# db/index.ts and lib/auth/auth.ts throw at import time if these are unset, and
# `next build` imports them. All pages render dynamically (they await cookies/
# headers), so no live DB is contacted during the build — these placeholders
# only satisfy the module-load checks. Real values are injected at runtime.
ENV DATABASE_URL=postgres://build:build@localhost:5432/build
ENV BETTER_AUTH_SECRET=build-time-placeholder-not-used-at-runtime
RUN npm run build

# ---- migrator: runs drizzle migrations against Postgres, then exits ----
# Reuses the builder layer (it has drizzle-kit, the config, schema, and the
# generated SQL in db/migrations). Used as a one-shot service in compose.
FROM builder AS migrator
ENV NODE_ENV=production
CMD ["npm", "run", "db:migrate"]

# ---- runner: production image (full node_modules — Turbopack build does not
#       currently emit .next/standalone, so we ship the deps the builder used).
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache libc6-compat \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next         ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public        ./public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules  ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json  ./package.json

USER nextjs
EXPOSE 3000
CMD ["node_modules/.bin/next", "start", "-p", "3000", "-H", "0.0.0.0"]
