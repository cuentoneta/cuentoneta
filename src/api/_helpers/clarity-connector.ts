import { environment } from './environment';
import type { ClarityApiResponse } from '../_utils/clarity.utils';

export const fetchClarityData = async (): Promise<ClarityApiResponse> => {
	const response = await fetch('https://www.clarity.ms/export-data/api/v1/project-live-insights', {
		headers: { Authorization: `Bearer ${environment.clarity.token}`, 'Content-Type': 'application/json' },
	});
	if (!response.ok) {
		// Clarity contesta los rechazos (token, cuota diaria) con cuerpo vacío: sin el status el fallo sería un error de parseo.
		throw new Error(`Clarity respondió ${response.status} ${response.statusText}: ${await response.text()}`);
	}
	return (await response.json()) as ClarityApiResponse;
};
