// Conector de Sanity
import { client } from '../_helpers/sanity-connector';

// Modelos
import { LandingPageContent } from '@models/landing-page-content.model';

// Queries
import { landingPageContentQuery } from '../_queries/content.query';

// Utils
import { mapLandingPageContent } from '../_utils/functions';

export async function fetchLandingPageContent(): Promise<LandingPageContent> {
	const result = await client.fetch(landingPageContentQuery);

	if (!result) {
		throw new Error('Landing page content not found');
	}

	return mapLandingPageContent(result);
}
