import { Hono } from 'hono';
import { environment } from '../_helpers/environment';
import { noindexNonProduction } from './noindex.middleware';

describe('noindexNonProduction', () => {
	const originalProduction = environment.production;

	afterEach(() => {
		environment.production = originalProduction;
	});

	function appUnderTest(): Hono {
		const app = new Hono();
		app.use('*', noindexNonProduction);
		app.get('/', (c) => c.text('ok'));
		return app;
	}

	it('should set X-Robots-Tag: noindex on responses in non-production environments', async () => {
		environment.production = false;

		const response = await appUnderTest().request('/');

		expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
	});

	it('should not set X-Robots-Tag in production so the site stays indexable', async () => {
		environment.production = true;

		const response = await appUnderTest().request('/');

		expect(response.headers.get('X-Robots-Tag')).toBeNull();
	});

	it('should preserve the downstream response body', async () => {
		environment.production = false;

		const response = await appUnderTest().request('/');

		expect(await response.text()).toBe('ok');
	});
});
