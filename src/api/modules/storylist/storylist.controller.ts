import express from 'express';
import {
	getStorylistBySlug,
	getAllStorylistTeasers,
	getStorylistNavigationTeasersByStorylistSlug,
} from './storylist.service';

const router = express.Router();

// Routes
export default router;

router.get('/', (req, res, next) => {
	const { slug, amount, ordering = 'asc' } = req.query;
	const limit = parseInt(amount as string) - 1;
	getStorylistBySlug({ slug: slug as string, amount: amount as string, limit, ordering: ordering as string })
		.then((result) => res.json(result))
		.catch((err) => next(err));
});

router.get('/teasers', (req, res, next) => {
	getAllStorylistTeasers()
		.then((result) => res.json(result))
		.catch((err) => next(err));
});

/**
 * Obtiene los teasers de las publicaciones de una storylist para su uso en la navegación de la misma.
 * @param req
 * @param res
 * @param next
 */
router.get('/:slug/navigation', (req, res, next) => {
	const { slug } = req.params;
	const { limit, offset } = req.query;
	getStorylistNavigationTeasersByStorylistSlug({
		slug: slug as string,
		limit: parseInt((limit ?? '100') as string),
		offset: parseInt((offset ?? '0') as string),
	})
		.then((result) => res.json(result))
		.catch((err) => next(err));
});
