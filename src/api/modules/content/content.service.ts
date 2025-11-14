// Conector de Sanity
import { client } from '../../_helpers/sanity-connector';

// Modelos
import { LandingPageContent, RotatingContent } from '@models/landing-page-content.model';

// Queries
import { landingPageContentQuery, rotatingContentQuery } from '../../_queries/content.query';

// Utils
import { getWeek, getYear } from 'date-fns';
import { mapLandingPageContent, mapStoryNavigationTeaserWithAuthor } from '../../_utils/functions';

export async function fetchLandingPageContent(): Promise<LandingPageContent> {
	const weekOfYear = getWeek(new Date());
	const year = getYear(new Date());

	const title = `${weekOfYear.toString().padStart(2, '0')}-${year}`;
	const landingPageResult = await client.fetch(landingPageContentQuery, { title });
	const rotatingContentResult = await client.fetch(rotatingContentQuery);

	if (!landingPageResult || !rotatingContentResult) {
		throw new Error('Landing page content not found');
	}

	return {
		...mapLandingPageContent({ ...landingPageResult, ...rotatingContentResult }),
	};
}

export async function fetchRotatingContent(): Promise<RotatingContent> {
	const result = await client.fetch(rotatingContentQuery);

	if (!result) {
		throw new Error('Rotating content not found');
	}

	return { ...result, mostRead: mapStoryNavigationTeaserWithAuthor(result.mostRead) };
}
