// Express: Imports y configuración de router
import { Request, Response, NextFunction, Router } from 'express';

const router = Router();
export default router;

// Funciones de service
import { addNextWeeksLandingPageContent, getLandingPageContent } from './content.service';

router.get('/landing-page', (req: Request, res: Response, next: NextFunction) =>
	getLandingPageContent()
		.then((result) => res.json(result))
		.catch((err) => next(err)),
);

/**
 * Endpoint encargado de agregar instancias de documentos landingPage para las próximas semanas, a fin de generar automáticamente
 * los documentos que luego son modificados manualmente para actualizar el contenido de la landing page desde Sanity Studio
 */
router.get('/add-next-weeks-landing-page-content', (req: Request, res: Response, next: NextFunction) => {
	const { weeksInTheFuture } = req.query;

	addNextWeeksLandingPageContent(parseInt((weeksInTheFuture ?? '4') as string))
		.then((result) => res.json(result))
		.catch((err) => next(err));
});
