import { z } from 'zod';
import { basePaginationSchema } from 'src/api/schemas/common.schemas';

export const paginationSchema = basePaginationSchema.extend({
	limit: basePaginationSchema.shape.limit.default(100),
	offset: basePaginationSchema.shape.offset.default(0),
});

export const storylistQuerySchema = z.object({
	amount: z.string().regex(/^\d+$/, 'amount must be a positive integer').optional(),
	ordering: z.enum(['asc', 'desc']).default('asc'),
});
