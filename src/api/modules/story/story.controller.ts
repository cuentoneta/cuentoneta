// Express: Imports y configuración de router
import { Request, Response, NextFunction, Router } from 'express';

const router = Router();
export default router;

import { StoriesByAuthorSlugArgs } from '../../interfaces/queryArgs';
import {
	getMostReadStoryNavigationTeasers,
	getStories,
	getStoriesByAuthorSlug,
	getStoryBySlug,
	getStoryNavigationTeaserByAuthorSlug,
	updateMostReadStories,
} from './story.service';

/**
 * Obtiene la lista completa de stories, usando paginación para la consulta
 */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
	const { limit, offset } = req.query;
	getStories(parseInt((limit ?? '100') as string), parseInt((offset ?? '0') as string))
		.then((result) => res.json(result))
		.catch((err) => next(err));
});

router.get('/:slug', (req: Request, res: Response, next: NextFunction) => {
	const { slug } = req.params;
	getStoryBySlug(slug as string)
		.then((result) => res.json(result))
		.catch((err) => next(err));
});

router.get('/author/:slug', (req: Request, res: Response, next: NextFunction) => {
	const { slug } = req.params;
	const { limit, offset } = req.query;
	const args: StoriesByAuthorSlugArgs = {
		slug: slug as string,
		limit: parseInt((limit ?? '100') as string),
		offset: parseInt((offset ?? '0') as string),
	};
	getStoriesByAuthorSlug(args)
		.then((result) => res.json(result))
		.catch((err) => next(err));
});

router.get('/author/:slug/navigation', (req: Request, res: Response, next: NextFunction) => {
	const { slug } = req.params;
	const { limit, offset } = req.query;
	getStoryNavigationTeaserByAuthorSlug({
		slug: slug as string,
		limit: parseInt((limit ?? '100') as string),
		offset: parseInt((offset ?? '0') as string),
	})
		.then((result) => res.json(result))
		.catch((err) => next(err));
});

router.get('/most-read', (req: Request, res: Response, next: NextFunction) => {
	const { limit, offset } = req.query;
	getMostReadStoryNavigationTeasers(parseInt((limit ?? '6') as string), parseInt((offset ?? '0') as string))
		.then((result) => res.json(result))
		.catch((err) => next(err));
});

router.get('/update-most-read', (req: Request, res: Response, next: NextFunction) => {
	updateMostReadStories()
		.then((result) => res.json(result))
		.catch((err) => next(err));
});
