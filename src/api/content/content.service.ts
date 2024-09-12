// Queries
import { fetchStorylistTeasers } from '../storylist/storylist.service';

export async function fetchLandingPageContent() {
	const cards = await fetchStorylistTeasers();
	const previews: [] = [];

	return { previews, cards };
}
