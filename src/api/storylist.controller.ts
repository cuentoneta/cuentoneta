import express from 'express';
import { fetchPreview, fetchStorylist } from './storylist.service';

const router = express.Router();

// Routes
router.get('/', get);
router.get('/preview', getPreview);

export default router;

function get(req: express.Request, res: express.Response, next: express.NextFunction) {
	const { slug, amount, ordering = 'asc' } = req.query;
	const limit = parseInt(amount as string) - 1;
	fetchStorylist({ slug: slug as string, amount: amount as string, limit, ordering: ordering as string })
		.then((result) => res.json(result))
		.catch((err) => next(err));
}

function getPreview(req: express.Request, res: express.Response, next: express.NextFunction) {
	const { slug } = req.query;
	fetchPreview(slug as string)
		.then((result) => res.json(result))
		.catch((err) => next(err));
}
