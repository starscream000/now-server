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

    server.get<{ Querystring: { category: string, startTime?: string, endTime?: string, limit?: string } }>('/', async (request, reply) => {

        const { category, startTime, endTime, limit } = request.query;
        const parsedLimit = typeof limit === 'string' ? Number.parseInt(limit, 10) : undefined;
        const queryParams = {
            category,
            startTime: startTime ? new Date(startTime) : undefined,
            endTime: endTime ? new Date(endTime) : undefined,
        };
        return service.getLogs(Number.isFinite(parsedLimit) ? parsedLimit : undefined, queryParams);
    });

    server.get('/hud-android', async (request, reply) => {
        return service.getHudData();
    });

}
