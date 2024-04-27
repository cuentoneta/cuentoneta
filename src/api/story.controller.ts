import express from 'express';
import * as storyService from './story.service';

const router = express.Router();

// Routes
router.get('/read', storyBySlug);
router.get('/author/:slug', storiesByAuthorSlug);

export default router;

function storyBySlug(req: express.Request, res: express.Response, next: express.NextFunction) {
	const { slug } = req.query;
	storyService
		.fetchForRead(slug as string)
		.then((result) => res.json(result))
		.catch((err) => next(err));
}

function storiesByAuthorSlug(req: express.Request, res: express.Response, next: express.NextFunction) {
	const { slug } = req.params;
	storyService
		.fetchByAuthorSlug(slug as string)
		.then((result) => res.json(result))
		.catch((err) => next(err));
}
