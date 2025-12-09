import { z } from 'zod';

export const addWeeksSchema = z.object({
	weeksInTheFuture: z
		.string()
		.regex(/^\d+$/, 'weeksInTheFuture must be a positive integer')
		.default('4')
		.transform(Number),
});
