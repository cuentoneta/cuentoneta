// Sanity Client
import { client } from './_helpers/sanity-connector';

// Queries
import { mapStorylist } from './_utils/functions';
import { fetchLandingPageContentQuery } from './_queries/content.query';
import { FetchLandingPageContentQueryResult } from './sanity/types';

export async function fetchLandingPageContent() {
	const result: FetchLandingPageContentQueryResult = await client.fetch(fetchLandingPageContentQuery);
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
