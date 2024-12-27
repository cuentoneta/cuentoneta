import express from 'express';
import { getRobotsTxt } from './robots.service';

const router = express.Router();

router.get('/', (req, res, next) => {
	getRobotsTxt()
		.then((result) => {
			res.setHeader('Content-Type', 'text/plain');
			res.send(result);
		})
		.catch((err) => {
			res.status(500).send('Error al obtener robots.txt');
			next(err);
		});
});

export default router;
