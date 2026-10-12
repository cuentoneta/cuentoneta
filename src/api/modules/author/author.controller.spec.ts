import authorController from './author.controller';
import { AuthorNotFoundError } from './author.errors';

describe('authorController', () => {
	// El validador corta antes del service, así que este caso no llega a consultar Sanity.
	it('answers a slug the schema rejects with the 404 of an unknown author', async () => {
		const response = await authorController.request('/no%20es%20slug');

		expect(response.status).toBe(404);
		await expect(response.json()).resolves.toEqual({ error: new AuthorNotFoundError('no es slug').message });
	});
});
