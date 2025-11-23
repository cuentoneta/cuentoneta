import { router, publicProcedure } from '../trpc';
import * as contributorService from '../../modules/contributor/contributor.service';

export const contributorRouter = router({
	getAll: publicProcedure.query(async () => {
		return contributorService.getAll();
	}),
});
