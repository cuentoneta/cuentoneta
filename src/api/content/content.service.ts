// Queries
import { fetchStorylistTeasers } from '../storylist/storylist.service';
import { LandingPageContent } from '@models/landing-page-content.model';

export async function fetchLandingPageContent(): Promise<LandingPageContent> {
	const cards = await fetchStorylistTeasers();

	return { cards };
}
