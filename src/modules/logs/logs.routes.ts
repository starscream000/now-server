import { FastifyInstance } from 'fastify';
import { LogService } from './logs.service';
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { logSchema } from './logs.schema';

export async function logRoutes(fastify: FastifyInstance) {
    const server = fastify.withTypeProvider<ZodTypeProvider>();


    const service = new LogService(fastify.prisma);

    server.post('/', { schema: { body: logSchema } }, async (request, reply) => {
        const log = await service.createLog(request.body as any);
        return reply.code(201).send(log);
    });

    server.get('/', async () => {
        return service.getRecentLogs();
    });
}
