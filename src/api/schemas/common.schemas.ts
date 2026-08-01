import { z } from 'zod';

export const slugSchema = z.object({
	slug: z
		.string()
		.nonempty('slug cannot be empty')
		.regex(/^[a-z0-9-]+$/i, `Slug must be a string with letters from a to z, numbers from 0 to 9 and '-'`),
});

export const basePaginationSchema = z.object({
	limit: z.string().regex(/^\d+$/, 'limit must be a positive integer').transform(Number),

	offset: z.string().regex(/^\d+$/, 'offset must be a positive integer').transform(Number),
});
