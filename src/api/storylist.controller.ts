import express from 'express';
import { fetchPreviewBySlug, fetchStorylistBySlugArgs } from './storylist.service';

const router = express.Router();

// Routes
router.get('/', getBySlug);
router.get('/preview', getPreview);

export default router;

function getBySlug(req: express.Request, res: express.Response, next: express.NextFunction) {
	const { slug, amount, ordering = 'asc' } = req.query;
	const limit = parseInt(amount as string) - 1;
	fetchStorylistBySlugArgs({ slug: slug as string, amount: amount as string, limit, ordering: ordering as string })
		.then((result) => res.json(result))
		.catch((err) => next(err));
}

function getPreview(req: express.Request, res: express.Response, next: express.NextFunction) {
	const { slug } = req.query;
	fetchPreviewBySlug(slug as string)
		.then((result) => res.json(result))
		.catch((err) => next(err));
}
