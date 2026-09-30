import { Hono } from 'hono';
import { environment } from '../_helpers/environment';
import { cronAuth } from './cron-auth.middleware';

describe('cronAuth', () => {
	const originalSecret = environment.cronSecret;

	beforeEach(() => {
		environment.cronSecret = 's3cret';
	});

	afterEach(() => {
		environment.cronSecret = originalSecret;
	});

	function appUnderTest(): Hono {
		const app = new Hono();
		app.get('/', cronAuth, (c) => c.text('ok'));
		return app;
	}

	it('should let the request through with the configured secret', async () => {
		const response = await appUnderTest().request('/', { headers: { Authorization: 'Bearer s3cret' } });

		expect(response.status).toBe(200);
	});

	it('should reject a request without credentials', async () => {
		const response = await appUnderTest().request('/');

		expect(response.status).toBe(401);
	});

	it('should reject a wrong secret', async () => {
		const response = await appUnderTest().request('/', { headers: { Authorization: 'Bearer other' } });

		expect(response.status).toBe(401);
	});

	it('should reject a non-bearer scheme carrying the right secret', async () => {
		const response = await appUnderTest().request('/', { headers: { Authorization: 'Basic s3cret' } });

		expect(response.status).toBe(400);
	});

	it.each([undefined, ''])('should reject everything when the secret is %j', async (secret) => {
		environment.cronSecret = secret;

		const response = await appUnderTest().request('/', { headers: { Authorization: 'Bearer undefined' } });

		expect(response.status).toBe(401);
	});
});
