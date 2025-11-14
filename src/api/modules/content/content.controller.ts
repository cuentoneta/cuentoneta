import express from 'express';
import { fetchLandingPageContent } from './content.service';
const router = express.Router();

export default router;

router.get('/landing-page', (_, res, next) =>
	fetchLandingPageContent()
		.then((result) => res.json(result))
		.catch((err) => next(err)),
);
