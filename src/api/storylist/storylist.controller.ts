import express from 'express';
import { fetchBySlug, fetchStorylistTeasers } from './storylist.service';

const router = express.Router();

// Routes
router.get('/', getBySlug);
router.get('/teasers', getTeasers);

export default router;

function getBySlug(req: express.Request, res: express.Response, next: express.NextFunction) {
	const { slug, amount, ordering = 'asc' } = req.query;
	const limit = parseInt(amount as string) - 1;
	fetchBySlug({ slug: slug as string, amount: amount as string, limit, ordering: ordering as string })
		.then((result) => res.json(result))
		.catch((err) => next(err));
}

function getTeasers(_: express.Request, res: express.Response, next: express.NextFunction) {
	fetchStorylistTeasers()
		.then((result) => res.json(result))
		.catch((err) => next(err));
}
