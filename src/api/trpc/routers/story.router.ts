import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import * as storyService from '../../modules/story/story.service';

export const storyRouter = router({
	getAll: publicProcedure
		.input(
			z.object({
				limit: z.number().int().default(100),
				offset: z.number().int().default(0),
			}),
		)
		.query(async ({ input }) => {
			return storyService.fetchAllStories(input.limit, input.offset);
		}),

	getByAuthorSlug: publicProcedure
		.input(
			z.object({
				slug: z.string(),
				limit: z.number().int().default(10),
				offset: z.number().int().default(0),
			}),
		)
		.query(async ({ input }) => {
			return storyService.fetchByAuthorSlug(input);
		}),

	getNavigationByAuthorSlug: publicProcedure
		.input(
			z.object({
				slug: z.string(),
				limit: z.number().int().default(10),
				offset: z.number().int().default(0),
			}),
		)
		.query(async ({ input }) => {
			return storyService.fetchStoryNavigationTeaserByAuthorSlug(input);
		}),

	getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
		return storyService.fetchStoryBySlug(input.slug);
	}),

	getBySlugs: publicProcedure.input(z.object({ slugs: z.array(z.string()) })).query(async ({ input }) => {
		return storyService.fetchStoriesBySlugs(input.slugs);
	}),

	getMostRead: publicProcedure
		.input(
			z.object({
				limit: z.number().int().default(6),
				offset: z.number().int().default(0),
			}),
		)
		.query(async ({ input }) => {
			return storyService.fetchMostRead(input.limit, input.offset);
		}),

	updateMostRead: publicProcedure.mutation(async () => {
		return storyService.updateMostRead();
	}),
});
