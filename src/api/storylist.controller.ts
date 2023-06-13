import express from 'express';
import { fetchPreview, fetchStorylist } from './storylist.service';

const router = express.Router();

// Routes
router.get('/', get);
router.get('/preview', getPreview);

export default router;

function get(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  fetchStorylist(req, res)
    .then((result) => res.json(result))
    .catch((err) => next(err));
}

function getPreview(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  fetchPreview(req, res)
    .then((result) => res.json(result))
    .catch((err) => next(err));
}
