import { router, publicProcedure } from '../trpc';
import * as contentService from '../../modules/content/content.service';

export const contentRouter = router({
	getLandingPageContent: publicProcedure.query(async () => {
		return contentService.fetchLandingPageContent();
	}),

	getRotatingContent: publicProcedure.query(async () => {
		return contentService.fetchRotatingContent();
	}),

	addNextWeeksLandingPageContent: publicProcedure.mutation(async () => {
		return contentService.addNextWeeksLandingPageContent();
	}),
});
