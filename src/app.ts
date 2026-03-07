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
    await server.register(() => { }, { prefix: '/api/hud-android' })

    try {
        await server.listen({ host: '0.0.0.0', port: 3000 });
        console.log('Logger active on http://localhost:3000');
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}

bootstrap();
