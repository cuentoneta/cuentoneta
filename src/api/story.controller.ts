import express from 'express';
import { fetchForRead } from './story.service';

const router = express.Router();

// Routes
router.get('/read', read);

export default router;

function read(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  fetchForRead(req, res)
    .then((result) => res.json(result))
    .catch((err) => next(err));
}
