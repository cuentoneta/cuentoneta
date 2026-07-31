import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { environment } from '../../_helpers/environment';
import { createLiteraryWorkController } from './literary-work.controller';
import { InMemoryLiteraryWorkRepository } from './literary-work.repository.mock';

describe('literaryWorkController', () => {
	const controller = createLiteraryWorkController(new InMemoryLiteraryWorkRepository(onoffLiteraryWorksMock));
	const knownSlug = onoffLiteraryWorksMock[0].slug;
	const originalProduction = environment.production;

	afterEach(() => {
		environment.production = originalProduction;
	});

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

	it('emite los headers de caché de borde y el tag por slug en el 200 en producción', async () => {
		environment.production = true;

		const response = await controller.request(`/${knownSlug}`);

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toContain('public, s-maxage=');
		expect(response.headers.get('Vercel-Cache-Tag')).toBe(`literary-work:${knownSlug}`);
	});

	it('no emite headers de caché fuera de producción', async () => {
		environment.production = false;

		const response = await controller.request(`/${knownSlug}`);

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
		expect(response.headers.get('Vercel-Cache-Tag')).toBeNull();
	});

	it('no emite headers de caché en el 404', async () => {
		environment.production = true;

		const response = await controller.request('/no-existe');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
	});
});
