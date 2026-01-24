import 'dotenv/config';
import Fastify from 'fastify';
import prismaPlugin from './plugins/prisma';
import { logRoutes } from './modules/logs/logs.routes';
import {
    validatorCompiler,
    serializerCompiler,
    ZodTypeProvider
} from 'fastify-type-provider-zod';

const server = Fastify({ logger: true })
    // 1. Set the Zod-specific compilers
    .setValidatorCompiler(validatorCompiler)
    .setSerializerCompiler(serializerCompiler)
    // 2. Cast the instance to use Zod types globally
    .withTypeProvider<ZodTypeProvider>();

async function bootstrap() {
    await server.register(prismaPlugin);
    await server.register(logRoutes, { prefix: '/api/logs' });

    try {
        await server.listen({ port: 3000 });
        console.log('Mind-Logger is active on http://localhost:3000');
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}

bootstrap();
