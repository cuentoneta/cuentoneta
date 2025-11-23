import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import * as storylistService from '../../modules/storylist/storylist.service';

export const storylistRouter = router({
	getAll: publicProcedure.query(async () => {
		return storylistService.fetchStorylistTeasers();
	}),

	getBySlug: publicProcedure
		.input(
			z.object({
				slug: z.string(),
				limit: z.number().default(10),
				offset: z.number().default(0),
				ordering: z.string().default('asc'),
			}),
		)
		.query(async ({ input }) => {
			return storylistService.fetchBySlug(input);
		}),

	getNavigation: publicProcedure
		.input(
			z.object({
				slug: z.string(),
				limit: z.number().int().default(10),
				offset: z.number().int().default(0),
			}),
		)
		.query(async ({ input }) => {
			return storylistService.fetchNavigation(input);
		}),
});
