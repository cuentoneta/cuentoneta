import express from 'express';
import { getAll } from './contributor.service';

const router = express.Router();

export default router;

router.get('/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
	getAll()
		.then((result) => res.json(result))
		.catch((err) => next(err));
});
