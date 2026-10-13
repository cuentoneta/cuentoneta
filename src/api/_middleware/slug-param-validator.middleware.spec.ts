import { Hono } from 'hono';
import { slugParamValidator } from './slug-param-validator.middleware';

class ProbeNotFoundError extends Error {
	constructor(slug: string) {
		super(`probe "${slug}" not found`);
	}
}

const HANDLER_REACHED = 'handler-reached';

function appUnderTest(): Hono {
	const app = new Hono();
	app.get(
		'/:slug',
		slugParamValidator((slug) => new ProbeNotFoundError(slug)),
		(c) => c.json({ marker: HANDLER_REACHED, slug: c.req.valid('param').slug }),
	);
	return app;
}

describe('slugParamValidator', () => {
	it('lets a well-formed slug reach the handler', async () => {
		const response = await appUnderTest().request('/el-aleph');

		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({ marker: HANDLER_REACHED, slug: 'el-aleph' });
	});

	it('answers a slug the schema rejects with the 404 of the resource, before the handler', async () => {
		const response = await appUnderTest().request('/no%20es%20slug');
		const body = await response.json();

		expect(response.status).toBe(404);
		expect(body).toEqual({ error: new ProbeNotFoundError('no es slug').message });
		expect(JSON.stringify(body)).not.toContain(HANDLER_REACHED);
	});
});
