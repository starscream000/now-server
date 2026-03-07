import { PrismaClient } from '../../generated/prisma/client';
import { hudResponeSchema } from './logs.schema';


export class LogService {
    constructor(private prisma: PrismaClient) { }

    async createLog(data: { category: string; rawText: string; payload: any }) {
        // Here you could add logic to "enrich" the log or trigger a "social" alert
        return this.prisma.log.create({ data });
    }

    async getLogs(limit = 10, queryParams: { category: string, startTime?: Date, endTime?: Date }) {
        return this.prisma.log.findMany({
            take: limit,
            orderBy: { timestamp: 'desc' },
            where: {
                ...(queryParams.category && { category: queryParams.category }),
                ...(queryParams.startTime || queryParams.endTime) && {
                    timestamp: {
                        ...(queryParams.startTime && { gte: queryParams.startTime }),
                        ...(queryParams.endTime && { lte: queryParams.endTime }),
                    }
                },
            },
        });
    }

    async getHudData() {



        var temp = hudResponeSchema.parse({ nowTask: "", transactionData: { headers: {}, data: [] } });

        return temp
    }
} 
