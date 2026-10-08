import { fetchClarityData } from './clarity-connector';

describe('fetchClarityData', () => {
	const originalFetch = globalThis.fetch;

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	function respondWith(response: Response): void {
		globalThis.fetch = async () => response;
	}

	it('should return the parsed metrics when Clarity responds successfully', async () => {
		const metrics = [{ metricName: 'PopularPages', information: [] }];
		respondWith(Response.json(metrics));

		await expect(fetchClarityData()).resolves.toEqual(metrics);
	});

	it('should report the status when Clarity rejects the request with an empty body', async () => {
		respondWith(new Response(null, { status: 429, statusText: 'Too Many Requests' }));

		await expect(fetchClarityData()).rejects.toThrow('Clarity respondió 429 Too Many Requests');
	});
});
