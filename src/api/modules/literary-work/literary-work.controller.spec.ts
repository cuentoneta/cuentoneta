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

	it.each(onoffLiteraryWorksMock)(
		'should return the full literary work with a 200 for "$slug"',
		async (literaryWork) => {
			const response = await controller.request(`/${literaryWork.slug}`);
			const body = await response.json();

			expect(response.status).toBe(200);
			expect(body.slug).toBe(literaryWork.slug);
		},
	);

	it('should respond 404 with an error envelope for an unknown slug', async () => {
		const response = await controller.request('/no-existe');
		const body = await response.json();

		expect(response.status).toBe(404);
		expect(body.error).toContain('no-existe');
	});

	it('should emit the edge cache headers on a 200 in production', async () => {
		environment.production = true;

		const response = await controller.request(`/${knownSlug}`);

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toContain('public, s-maxage=');
	});

	it('should not emit cache headers outside production', async () => {
		environment.production = false;

		const response = await controller.request(`/${knownSlug}`);

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
	});

	it('should not emit cache headers on a 404', async () => {
		environment.production = true;

		const response = await controller.request('/no-existe');

		expect(response.headers.get('Vercel-CDN-Cache-Control')).toBeNull();
	});
});
