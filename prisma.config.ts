import { defineConfig, env } from 'prisma/config';
import 'dotenv/config'; // Explicitly load .env variables for the CLI

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        // Prisma 7 uses this env() helper for CLI commands
        url: env('DATABASE_URL'),
    },
});