// Express: Imports y configuración de router
import { Request, Response, NextFunction, Router } from 'express';

const router = Router();
export default router;

// Funciones de service
import { getAllAuthors, getAuthorBySlug } from './author.service';

router.get('/', (req: Request, res: Response, next: NextFunction) => {
	getAllAuthors()
		.then((result) => res.json(result))
		.catch((err) => next(err));
});

router.get('/:slug', (req: Request, res: Response, next: NextFunction) => {
	const { slug } = req.params;
	getAuthorBySlug(slug as string)
		.then((result) => res.json(result))
		.catch((err) => next(err));
});
