import { Request, Response, NextFunction, Router } from 'express';
import { fetchLandingPageContent } from './content.service';
const router = Router();

// Routes
router.get('/landing-page', (_: Request, res: Response, next: NextFunction) => {
	fetchLandingPageContent()
		.then((result) => res.json(result))
		.catch((err) => next(err));
});

export default router;
