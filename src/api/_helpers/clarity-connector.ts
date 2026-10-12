import { clarityResponseSchema, type ClarityResponse } from '@schemas/clarity.schemas';
import { environment } from './environment';
import { ClarityRequestError, ClarityResponseError } from './clarity-connector.errors';

// Trae todas las métricas de los insights del proyecto y valida solo que sean una lista de métricas; la
// forma de cada una la valida su extractor en `clarity.utils.ts`. Una falla de red propaga el error de
// `fetch` tal cual.
export const fetchClarityData = async (): Promise<ClarityResponse> => {
	const response = await fetch('https://www.clarity.ms/export-data/api/v1/project-live-insights', {
		headers: { Authorization: `Bearer ${environment.clarity.token}`, 'Content-Type': 'application/json' },
	});
	if (!response.ok) {
		// Clarity contesta los rechazos (token, cuota diaria) con cuerpo vacío: sin el status el fallo sería un error de parseo.
		throw new ClarityRequestError(response.status, response.statusText, await response.text());
	}

	const body = await response.json().catch((cause: unknown) => {
		throw new ClarityResponseError('the body could not be parsed as JSON', { cause });
	});
	const metrics = clarityResponseSchema.safeParse(body);
	if (!metrics.success) {
		throw new ClarityResponseError('the body is not a list of metrics', { cause: metrics.error });
	}
	return metrics.data;
};
