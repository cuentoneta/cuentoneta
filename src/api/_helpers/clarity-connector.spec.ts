import { ZodError } from 'zod';
import { restoreAllMocks, spyOn } from '@test-utils';
import { environment } from './environment';
import { fetchClarityData } from './clarity-connector';
import { ClarityRequestError, ClarityResponseError } from './clarity-connector.errors';

const metrics = [
	{ metricName: 'Traffic', information: [{ totalSessionCount: '10' }] },
	{ metricName: 'PopularPages', information: [{ url: 'https://www.cuentoneta.ar/literary-work/a', visitsCount: '3' }] },
];

function respondWith(body: unknown, init?: ResponseInit) {
	return spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), init));
}

describe('fetchClarityData', () => {
	const originalToken = environment.clarity.token;

	beforeEach(() => {
		environment.clarity.token = 'clarity-token';
	});

	afterEach(() => {
		environment.clarity.token = originalToken;
		restoreAllMocks();
	});

	it('should return every metric and authenticate with the Clarity token', async () => {
		const fetchSpy = respondWith(metrics);

		await expect(fetchClarityData()).resolves.toEqual(metrics);

		expect(fetchSpy.mock.calls[0][1]).toMatchObject({
			headers: { Authorization: 'Bearer clarity-token', 'Content-Type': 'application/json' },
		});
	});

	it('should not validate the content of each metric', async () => {
		const body = [{ metricName: 'PopularPages', information: 'sin forma' }];
		respondWith(body);

		await expect(fetchClarityData()).resolves.toEqual(body);
	});

	it.each([
		['an object', {}],
		['null', null],
		['a list of non-objects', [1]],
		['a list of metrics without a name', [{ information: [] }]],
	])('should throw a typed error when the body is %s', async (_case, body) => {
		respondWith(body);

		const error = await fetchClarityData().catch((cause: unknown) => cause);

		expect(error).toBeInstanceOf(ClarityResponseError);
		expect((error as ClarityResponseError).cause).toBeInstanceOf(ZodError);
	});

	it('should throw a typed error when the body is not JSON', async () => {
		spyOn(globalThis, 'fetch').mockResolvedValue(new Response('<html>', { status: 200 }));

		const error = await fetchClarityData().catch((cause: unknown) => cause);

		expect(error).toBeInstanceOf(ClarityResponseError);
		expect((error as ClarityResponseError).cause).toMatchObject({ name: 'SyntaxError' });
	});

	it.each([401, 500])('should throw a request error, not a contract error, on status %i', async (status) => {
		respondWith({ message: 'no' }, { status });

		const error = await fetchClarityData().catch((cause: unknown) => cause);

		expect(error).toBeInstanceOf(ClarityRequestError);
		expect(error).not.toBeInstanceOf(ClarityResponseError);
		expect((error as ClarityRequestError).status).toBe(status);
	});

	it('should report the status when Clarity rejects the request with an empty body', async () => {
		spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 429, statusText: 'Too Many Requests' }));

		const error = await fetchClarityData().catch((cause: unknown) => cause);

		expect(error).toBeInstanceOf(ClarityRequestError);
		expect((error as ClarityRequestError).message).toContain('Clarity API responded with status 429 Too Many Requests');
	});

	it('should let a network failure through untouched', async () => {
		const networkFailure = new TypeError('fetch failed');
		spyOn(globalThis, 'fetch').mockRejectedValue(networkFailure);

		const error = await fetchClarityData().catch((cause: unknown) => cause);

		expect(error).toBe(networkFailure);
		expect(error).not.toBeInstanceOf(ClarityRequestError);
		expect(error).not.toBeInstanceOf(ClarityResponseError);
	});
});
