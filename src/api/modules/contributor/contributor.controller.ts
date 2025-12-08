// Hono: Imports y configuración
import { Hono } from 'hono';

// Funciones de service
import { getAllContributors } from './contributor.service';

const contributorController = new Hono();

contributorController.get('/', async (c) => {
	const result = await getAllContributors();
	return c.json(result);
});

export default contributorController;
