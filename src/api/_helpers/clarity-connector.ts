import { environment } from './environment';
import { ClarityApiResponse } from '../_utils/clarity.utils';

export const fetchClarityData = async (): Promise<ClarityApiResponse> => {
	const response = await fetch('https://www.clarity.ms/export-data/api/v1/project-live-insights', {
		headers: { Authorization: `Bearer ${environment.clarity.token}`, ContentType: 'application/json' },
	});
	return (await response.json()) as ClarityApiResponse;
};
