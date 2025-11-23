import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import * as authorService from '../../modules/author/author.service';

export const authorRouter = router({
	getAll: publicProcedure.query(async () => {
		return authorService.getAll();
	}),

	getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
		return authorService.getBySlug(input.slug);
	}),
});
