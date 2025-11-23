import express from 'express';
import { fetchBySlug, fetchNavigation, fetchStorylistTeasers } from './storylist.service';

const router = express.Router();

// Routes
router.get('/', getBySlug);
router.get('/teasers', getTeasers);
router.get('/:slug/navigation', getNavigationBySlug);

export default router;

function getBySlug(req: express.Request, res: express.Response, next: express.NextFunction) {
	const { slug, offset, limit, ordering = 'asc' } = req.query;
	fetchBySlug({
		slug: slug as string,
		offset: parseInt(offset as string),
		limit: parseInt(limit as string),
		ordering: ordering as string,
	})
		.then((result) => res.json(result))
		.catch((err) => next(err));
}

function getTeasers(_: express.Request, res: express.Response, next: express.NextFunction) {
	fetchStorylistTeasers()
		.then((result) => res.json(result))
		.catch((err) => next(err));
}

/**
 * Obtiene los teasers de las publicaciones de una storylist para su uso en la navegación de la misma.
 * @param req
 * @param res
 * @param next
 */
function getNavigationBySlug(req: express.Request, res: express.Response, next: express.NextFunction) {
	const { slug } = req.params;
	const { limit, offset } = req.query;
	fetchNavigation({
		slug: slug as string,
		limit: parseInt((limit ?? '100') as string),
		offset: parseInt((offset ?? '0') as string),
	})
		.then((result) => res.json(result))
		.catch((err) => next(err));
}
