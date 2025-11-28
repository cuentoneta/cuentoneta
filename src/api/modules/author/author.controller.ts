import express from 'express';
import { getAllAuthors, getAuthorBySlug } from './author.service';

// Funciones de service

const router = express.Router();

// Routes
export default router;

router.get('/', (req, res, next) => {
	getAllAuthors()
		.then((result) => res.json(result))
		.catch((err) => next(err));
});

router.get('/:slug', (req, res, next) => {
	const { slug } = req.params;
	getAuthorBySlug(slug as string)
		.then((result) => res.json(result))
		.catch((err) => next(err));
});
