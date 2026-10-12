import { ZodError } from 'zod';
import { ClarityResponseError } from '../_helpers/clarity-connector.errors';
import { getPopularPagesMetric } from './clarity.utils';

const popularPages = {
	metricName: 'PopularPages',
	information: [{ url: 'https://www.cuentoneta.ar/literary-work/a', visitsCount: '3' }],
};

describe('getPopularPagesMetric', () => {
	it('should return the PopularPages metric among the others', () => {
		expect(getPopularPagesMetric([{ metricName: 'Traffic', information: [] }, popularPages])).toEqual(popularPages);
	});

	it('should not fail because of a malformed metric nobody consumes', () => {
		expect(getPopularPagesMetric([{ metricName: 'Traffic', information: 'sin forma' }, popularPages])).toEqual(
			popularPages,
		);
	});

	it('should not fail because of a field of PopularPages the ranking does not read', () => {
		const metric = {
			...popularPages,
			information: [{ url: 'https://www.cuentoneta.ar/literary-work/a', visitsCount: 3 }],
		};

		expect(getPopularPagesMetric([metric])).toEqual(metric);
	});

	it('should return undefined when Clarity does not report the metric', () => {
		expect(getPopularPagesMetric([{ metricName: 'Traffic', information: [] }])).toBeUndefined();
	});

	it.each([
		['information is not an array', { metricName: 'PopularPages', information: 'x' }],
		['an entry has no url', { metricName: 'PopularPages', information: [{ visitsCount: '1' }] }],
		['a url is not a string', { metricName: 'PopularPages', information: [{ url: 1, visitsCount: '1' }] }],
	])('should throw a typed error when %s', (_case, metric) => {
		const error = (() => {
			try {
				return getPopularPagesMetric([metric]);
			} catch (cause) {
				return cause;
			}
		})();

		expect(error).toBeInstanceOf(ClarityResponseError);
		expect((error as ClarityResponseError).cause).toBeInstanceOf(ZodError);
	});
});
