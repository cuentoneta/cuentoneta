import { ZodError } from 'zod';
import { restoreAllMocks, spyOn } from '@test-utils';
import { environment } from './environment';
import { fetchPopularPagesMetric } from './clarity-connector';
import { ClarityRequestError, ClarityResponseError } from './clarity-connector.errors';

const popularPages = {
	metricName: 'PopularPages',
	information: [{ url: 'https://www.cuentoneta.ar/literary-work/a', visitsCount: '3' }],
};

function respondWith(body: unknown, init?: ResponseInit) {
	return spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(body), init));
}

describe('fetchPopularPagesMetric', () => {
	const originalToken = environment.clarity.token;

	beforeEach(() => {
		environment.clarity.token = 'clarity-token';
	});

	afterEach(() => {
		environment.clarity.token = originalToken;
		restoreAllMocks();
	});

	it('should return the PopularPages metric and authenticate with the Clarity token', async () => {
		const fetchSpy = respondWith([{ metricName: 'Traffic', information: [] }, popularPages]);

		await expect(fetchPopularPagesMetric()).resolves.toEqual(popularPages);

		expect(fetchSpy.mock.calls[0][1]).toMatchObject({ headers: { Authorization: 'Bearer clarity-token' } });
	});

	it('should not fail because of a malformed metric nobody consumes', async () => {
		respondWith([{ metricName: 'Traffic', information: 'sin forma' }, popularPages]);

		await expect(fetchPopularPagesMetric()).resolves.toEqual(popularPages);
	});

	it('should return undefined when Clarity does not report the metric', async () => {
		respondWith([]);

		await expect(fetchPopularPagesMetric()).resolves.toBeUndefined();
	});

	it.each([
		['information is not an array', { metricName: 'PopularPages', information: 'x' }],
		['an entry has no url', { metricName: 'PopularPages', information: [{ visitsCount: '1' }] }],
		['a url is not a string', { metricName: 'PopularPages', information: [{ url: 1, visitsCount: '1' }] }],
	])('should throw a typed error when %s', async (_case, metric) => {
		respondWith([metric]);

		const error = await fetchPopularPagesMetric().catch((cause: unknown) => cause);

		expect(error).toBeInstanceOf(ClarityResponseError);
		expect((error as ClarityResponseError).cause).toBeInstanceOf(ZodError);
	});

	it.each([
		['an object', {}],
		['null', null],
		['a list of non-objects', [1]],
	])('should throw a typed error when the body is %s', async (_case, body) => {
		respondWith(body);

		await expect(fetchPopularPagesMetric()).rejects.toThrow(ClarityResponseError);
	});

	it('should throw a typed error when the body is not JSON', async () => {
		spyOn(globalThis, 'fetch').mockResolvedValue(new Response('<html>', { status: 200 }));

		const error = await fetchPopularPagesMetric().catch((cause: unknown) => cause);

		expect(error).toBeInstanceOf(ClarityResponseError);
		expect((error as ClarityResponseError).cause).toMatchObject({ name: 'SyntaxError' });
	});

	it('should not fail because of a field of PopularPages the ranking does not read', async () => {
		respondWith([
			{ ...popularPages, information: [{ url: 'https://www.cuentoneta.ar/literary-work/a', visitsCount: 3 }] },
		]);

		await expect(fetchPopularPagesMetric()).resolves.toMatchObject({ metricName: 'PopularPages' });
	});

	it.each([401, 500])('should throw a request error, not a contract error, on status %i', async (status) => {
		respondWith({ message: 'no' }, { status });

		const error = await fetchPopularPagesMetric().catch((cause: unknown) => cause);

		expect(error).toBeInstanceOf(ClarityRequestError);
		expect(error).not.toBeInstanceOf(ClarityResponseError);
		expect((error as ClarityRequestError).status).toBe(status);
	});

	it('should let a network failure through untouched', async () => {
		const networkFailure = new TypeError('fetch failed');
		spyOn(globalThis, 'fetch').mockRejectedValue(networkFailure);

		const error = await fetchPopularPagesMetric().catch((cause: unknown) => cause);

		expect(error).toBe(networkFailure);
		expect(error).not.toBeInstanceOf(ClarityRequestError);
		expect(error).not.toBeInstanceOf(ClarityResponseError);
	});
});
