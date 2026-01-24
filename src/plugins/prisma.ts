import 'dotenv/config';
import fp from 'fastify-plugin';
// 1. Verify this path matches your schema.prisma 'output' field exactly
import { PrismaClient } from '../generated/prisma';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
/**
 * 2. TypeScript Augmentation
 * This tells TypeScript that the FastifyInstance now includes 'prisma'.
 * Without this, 'fastify.prisma' will throw a red squiggly error.
 */
declare module 'fastify' {
    interface FastifyInstance {
        prisma: PrismaClient;
    }
}
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export default fp(async (fastify) => {
    const prisma = new PrismaClient({ adapter });

    try {
        await prisma.$connect();

        // 3. Decorate the instance
        fastify.decorate('prisma', prisma);
        fastify.log.info('Connected to TimescaleDB');
    } catch (error) {
        fastify.log.error(error, 'Prisma connection error:');
        // Important: Use fastify.close() instead of process.exit 
        // to allow other plugins to shut down cleanly
        await fastify.close();
        process.exit(1);
    }

    // 4. Correct hook signature
    fastify.addHook('onClose', async (instance) => {
        instance.log.info('Disconnecting TimescaleDB...');
        await instance.prisma.$disconnect();
    });
});
