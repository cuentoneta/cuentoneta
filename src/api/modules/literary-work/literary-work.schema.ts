import { z } from 'zod';

export const literaryWorkQuerySchema = z.object({
	section: z.string().regex(/^\d+$/, 'section must be a non-negative integer').transform(Number).optional(),
});
