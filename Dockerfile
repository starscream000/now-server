# Stage 1: Build
FROM node:22-slim AS builder

WORKDIR /app

# Install openssl for Prisma 7
RUN apt-get update && apt-get install -y openssl

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma Client (crucial for 2026 binary compatibility)
RUN npx prisma generate

# Compile TypeScript
RUN npm run build

# Stage 2: Run
FROM node:22-slim

WORKDIR /app

# Re-install openssl in production stage
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src/generated ./dist/generated
COPY --from=builder /app/prisma ./prisma

# Install only production dependencies
RUN npm install --omit=dev

EXPOSE 3000

# Start the mind-logger
CMD ["node", "dist/app.js"]
