import { stat } from 'node:fs';
import { z } from 'zod';

const TodoPayload = z.object({
    horizon: z.enum(['short', 'medium', 'long']),
    priority: z.number().min(1).max(5).default(3),
    deadline: z.iso.datetime().optional(),
    status: z.enum(['pending', 'in-progress', 'completed']).default('pending'),
});

const SocialPayload = z.object({
    platform: z.enum(['tweet', 'linkedin']),
    isDraft: z.boolean().default(true),
});

const TransactionPayload = z.object({
    amount: z.number().positive(),
    currency: z.string().length(3).default('USD'),
    type: z.enum(['income', 'expense']),
});

export const logSchema = z.discriminatedUnion('category', [
    z.object({ category: z.literal('todo'), rawText: z.string(), payload: TodoPayload }),
    z.object({ category: z.literal('social'), rawText: z.string(), payload: SocialPayload }),
    z.object({ category: z.literal('transaction'), rawText: z.string(), payload: TransactionPayload }),
]);

export const hudResponeSchema = z.object({

    data: z.object({
        nowTaskData: z.object({
            now: z.string().optional(),

        }),

        transactionData: z.object({ summary: z.object({}), data: z.array(z.object({})).optional(), }),
    }),
});


// Type inferred for your new 'Log' naming
export type LogInput = z.infer<typeof logSchema>;
