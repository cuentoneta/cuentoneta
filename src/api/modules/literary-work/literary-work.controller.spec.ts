import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { createLiteraryWorkController } from './literary-work.controller';
import { InMemoryLiteraryWorkRepository } from './literary-work.repository.mock';

describe('literaryWorkController', () => {
	const controller = createLiteraryWorkController(new InMemoryLiteraryWorkRepository(onoffLiteraryWorksMock));

	it.each(onoffLiteraryWorksMock)('devuelve la obra completa con status 200 para "$slug"', async (literaryWork) => {
		const response = await controller.request(`/${literaryWork.slug}`);
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body.slug).toBe(literaryWork.slug);
	});

	it('responde 404 con un envelope de error para un slug desconocido', async () => {
		const response = await controller.request('/no-existe');
		const body = await response.json();

		expect(response.status).toBe(404);
		expect(body.error).toContain('no-existe');
	});
});
