// Express: Imports y configuración de router
import { Request, Response, NextFunction, Router } from 'express';

const router = Router();
export default router;

// Funciones de service
import { getAllContributors } from './contributor.service';

router.get('/', (req: Request, res: Response, next: NextFunction) => {
	getAllContributors()
		.then((result) => res.json(result))
		.catch((err) => next(err));
});
