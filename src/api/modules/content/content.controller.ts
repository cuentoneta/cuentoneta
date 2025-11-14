import express from 'express';
import { addNextWeeksLandingPageContent, fetchLandingPageContent } from './content.service';
const router = express.Router();

export default router;

router.get('/landing-page', (_, res, next) =>
	fetchLandingPageContent()
		.then((result) => res.json(result))
		.catch((err) => next(err)),
);

/**
 * Endpoint encargado de agregar instancias de documentos landingPage para las próximas semanas, a fin de generar automáticamente
 * los documentos que luego son modificados manualmente para actualizar el contenido de la landing page desde Sanity Studio
 */
router.get('/add-next-weeks-landing-page-content', (req, res, next) => {
	addNextWeeksLandingPageContent()
		.then((result) => res.json(result))
		.catch((err) => next(err));
});
