import { z } from 'zod';
import { basePaginationSchema } from 'src/api/schemas/common.schemas';

export const mostReadStorySchema = basePaginationSchema.extend({
	limit: basePaginationSchema.shape.limit.default(6),
	offset: basePaginationSchema.shape.offset.default(0),
});

export const storyControllerSchema = z.object({
	limit: basePaginationSchema.shape.limit.default(100),
	offset: basePaginationSchema.shape.offset.default(0),
});
