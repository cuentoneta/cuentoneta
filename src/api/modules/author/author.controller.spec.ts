import { onoffAuthorDocumentsMock } from '@mocks/onoff-documents.mock';
import authorController from './author.controller';
import { AuthorNotFoundError } from './author.errors';

const [canonAuthor] = onoffAuthorDocumentsMock;

describe('authorController', () => {
	// El validador corta antes del service, así que estos casos no llegan a consultar Sanity.
	it('answers a slug the schema rejects with the 404 of an unknown author', async () => {
		const response = await authorController.request('/no%20es%20slug');

		expect(response.status).toBe(404);
		await expect(response.json()).resolves.toEqual({ error: new AuthorNotFoundError('no es slug').message });
	});

	it('answers the uppercase twin of an existing slug, which the domain rejects, with a 404', async () => {
		const response = await authorController.request(`/${canonAuthor.slug.current.toUpperCase()}`);

		expect(response.status).toBe(404);
	});
});
