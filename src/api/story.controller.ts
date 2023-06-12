import express from 'express';
import { fetchForRead, fetchLatest } from './story.service';

const router = express.Router();

// Routes
router.get('/latest', latest);
router.get('/read', read);

export default router;

function latest(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  fetchLatest(req, res)
    .then((result) => res.json(result))
    .catch((err) => next(err));
}

function read(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  fetchForRead(req, res)
    .then((result) => res.json(result))
    .catch((err) => next(err));
}
