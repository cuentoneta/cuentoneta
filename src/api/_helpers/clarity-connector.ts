import { clarityResponseSchema, popularPagesMetricSchema, type PopularPagesMetric } from '@schemas/clarity.schemas';
import { environment } from './environment';
import { ClarityRequestError, ClarityResponseError } from './clarity-connector.errors';

// Valida solo la métrica que se consume: una deformación en otra no debe tumbar el ranking. Una falla de
// red propaga el error de `fetch` tal cual; `undefined` significa que Clarity no reportó la métrica.
export const fetchPopularPagesMetric = async (): Promise<PopularPagesMetric | undefined> => {
	const response = await fetch('https://www.clarity.ms/export-data/api/v1/project-live-insights', {
		headers: { Authorization: `Bearer ${environment.clarity.token}`, ContentType: 'application/json' },
	});
	if (!response.ok) {
		throw new ClarityRequestError(response.status);
	}

	const body = await response.json().catch((cause: unknown) => {
		throw new ClarityResponseError('the body is not valid JSON', { cause });
	});
	const metrics = clarityResponseSchema.safeParse(body);
	if (!metrics.success) {
		throw new ClarityResponseError('the body is not a list of metrics', { cause: metrics.error });
	}

	const metric = metrics.data.find(({ metricName }) => metricName === 'PopularPages');
	if (!metric) {
		return undefined;
	}
	const popularPages = popularPagesMetricSchema.safeParse(metric);
	if (!popularPages.success) {
		throw new ClarityResponseError('the PopularPages metric is malformed', { cause: popularPages.error });
	}
	return popularPages.data;
};
