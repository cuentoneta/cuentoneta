// Sanity Client
import { client } from './_helpers/sanity-connector';

// Queries
import { mapStorylist } from './_utils/functions';
import { fetchLandingPageContentQuery } from './_queries/content.query';

export async function fetchLandingPageContent() {
	const result = await client.fetch(fetchLandingPageContentQuery);
	const cards = [];
	const previews = [];

	for (const preview of result.previews) {
		previews.push(await mapStorylist(preview));
	}

	for (const card of result.cards) {
		cards.push(await mapStorylist(card));
	}

	return { previews, cards };
}
