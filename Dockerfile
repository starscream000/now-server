# Stage 1: install deps once; cache-friendly
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
# Why: reproducible install from lockfile; keeps a cached layer when code changes.

# Stage 2: build TS and Prisma client
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build
# Why: generate typed Prisma client and compile TS -> JS in /dist.

# Stage 3: runtime image (small)
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
COPY package.json ./
# Run migrations idempotently, then start API
CMD ["sh","-c","node -e \"try{require('dotenv').config()}catch{}\" && npx prisma migrate deploy && node dist/index.js"]
# Why:
# - Keep migrations in the image so we can 'deploy' them on boot.
# - 'migrate deploy' applies only existing migration files (safe in prod).
