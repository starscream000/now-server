import { PrismaClient } from '../../generated/prisma/client';
import { hudResponeSchema, TodoPayload, TodoPayloadType } from './logs.schema';
import { z } from 'zod';


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

        const todos = await this.prisma.log.findMany({
            where: {
                category: 'todo',
                payload: {
                    path: ['status'],
                    not: 'completed',
                }
            },
            orderBy: { timestamp: 'desc' },
        });

        // Filter out past deadlines in memory
        const activeTodos = todos.filter(todo => {
            const payload = todo.payload as TodoPayloadType;
            if (!payload.deadline) return true;
            return new Date(payload.deadline) > new Date();
        });

        if (activeTodos.length === 0) return null;

        // Score and sort
        const scored = activeTodos
            .map(todo => ({
                ...todo,
                score: calculateScore(todo.payload as TodoPayloadType),
            }))
            .sort((a, b) => b.score - a.score);
        var transactionData = await this.prisma.log.findMany({ where: { category: 'transaction' }, orderBy: { timestamp: 'desc' } });
        const nowTask = scored[0];
        const nowPayload = nowTask.payload as TodoPayloadType;
        var temp = hudResponeSchema.parse({
            data: {  // missing this
                nowTaskData: {
                    ...nowPayload,
                    now: nowTask.rawText,
                },
                transactionData: { summary: { today: 0, thisWeek: 0, thisMonth: 0 }, data: transactionData }
            }
        });

        return temp
    }
}


function calculateScore(payload: TodoPayloadType): number {
    const now = new Date();

    // Base score from priority (20 to 100)
    let score = payload.priority * 20;

    // Status boost
    if (payload.status === 'in-progress') score += 40;

    // Horizon multiplier
    const horizonMultiplier = {
        short: 1.3,
        medium: 1.1,
        long: 1.0,
    }[payload.horizon];

    // Deadline urgency bonus
    if (payload.deadline) {
        const hoursUntilDeadline = (new Date(payload.deadline).getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursUntilDeadline < 24) score += 100;
        else if (hoursUntilDeadline < 72) score += 60;
        else if (hoursUntilDeadline < 168) score += 30;
        else if (hoursUntilDeadline < 720) score += 10;
    }

    return score * horizonMultiplier;
}
