import { z } from 'zod';
import { isSlug } from '@models/slug.model';

export const slugValueSchema = z
	.string()
	.refine(isSlug, `Slug must be lowercase letters from a to z and numbers from 0 to 9, joined by single '-'`);

export const slugParamSchema = z.object({ slug: slugValueSchema });

export const basePaginationSchema = z.object({
	limit: z.string().regex(/^\d+$/, 'limit must be a positive integer').transform(Number),

	offset: z.string().regex(/^\d+$/, 'offset must be a positive integer').transform(Number),
});
