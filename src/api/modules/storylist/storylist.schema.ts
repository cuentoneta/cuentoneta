import { z } from 'zod';

export const storylistQuerySchema = z.object({
	amount: z.string().regex(/^\d+$/, 'amount must be a positive integer').optional(),
	ordering: z.enum(['asc', 'desc']).default('asc'),
});
