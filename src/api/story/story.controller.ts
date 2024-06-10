import express from 'express';
import * as storyService from './story.service';
import { StoriesByAuthorSlugArgs } from '../interfaces/sanity';

const router = express.Router();

// Routes
router.get('/read', getBySlug);
router.get('/author/:slug', getStoriesByAuthorSlug);

export default router;

function getBySlug(req: express.Request, res: express.Response, next: express.NextFunction) {
	const { slug } = req.query;
	storyService
		.fetchBySlug(slug as string)
		.then((result) => res.json(result))
		.catch((err) => next(err));
}

function getStoriesByAuthorSlug(req: express.Request, res: express.Response, next: express.NextFunction) {
	const { slug } = req.params;
	const { limit, offset } = req.query;
	const args: StoriesByAuthorSlugArgs = {
		slug: slug as string,
		limit: parseInt((limit ?? '0') as string),
		offset: parseInt((offset ?? '0') as string),
	};
	storyService
		.fetchByAuthorSlug(args)
		.then((result) => res.json(result))
		.catch((err) => next(err));
}
