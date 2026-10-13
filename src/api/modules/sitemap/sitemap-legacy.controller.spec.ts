import { restoreAllMocks, spyOn } from '@test-utils';
import { createSitemapLegacyController } from './sitemap-legacy.controller';

describe('sitemap legacy controller', () => {
	afterEach(() => {
		restoreAllMocks();
	});

	it('serves the generated sitemap as XML', async () => {
		const xml = '<?xml version="1.0" encoding="UTF-8"?><urlset/>';

		const response = await createSitemapLegacyController(() => Promise.resolve(xml)).request('/');

		expect(response.status).toBe(200);
		expect(response.headers.get('Content-Type')).toBe('application/xml');
		expect(response.headers.get('Cache-Control')).toBe('public, max-age=21600');
		expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
		expect(await response.text()).toBe(xml);
	});

	it('answers 500 when the sitemap cannot be generated', async () => {
		const consoleError = spyOn(console, 'error').mockImplementation(() => undefined);

		const response = await createSitemapLegacyController(() => Promise.reject(new Error('Sanity no responde'))).request(
			'/',
		);

		expect(response.status).toBe(500);
		expect(consoleError).toHaveBeenCalled();
	});
});
