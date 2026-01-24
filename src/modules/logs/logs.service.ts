import { PrismaClient } from '../../generated/prisma/client';


export class LogService {
    constructor(private prisma: PrismaClient) { }

    async createLog(data: { category: string; rawText: string; payload: any }) {
        // Here you could add logic to "enrich" the log or trigger a "social" alert
        return this.prisma.log.create({ data });
    }

    async getRecentLogs(limit = 10) {
        return this.prisma.log.findMany({
            take: limit,
            orderBy: { timestamp: 'desc' },
        });
    }
}
