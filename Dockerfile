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
RUN ls -la dist/  # add this temporarily

# Stage 2: Run
FROM node:22-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src/generated ./dist/src/generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts  

RUN npm install --omit=dev
RUN npm install tsx  # needed to run .ts config at runtime

EXPOSE 3000

CMD ["node", "dist/src/app.js"]