import express from 'express';
import { fetchLandingPageContent } from './content.service';
const router = express.Router();

// Routes
router.get('/landing-page', getLandingPageContent);

export default router;

function getLandingPageContent(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  fetchLandingPageContent(req, res)
    .then((result) => res.json(result))
    .catch((err) => next(err));
}
