// Sanity Client
import { client } from './_helpers/sanity-connector';

// Queries
import { storylistCardQuery, storylistPreviewQuery } from './_queries/storylist.query';
import { mapStorylist } from './_utils/functions';

export async function fetchLandingPageContent() {
	const query = `*[_type == 'landingPage'] {
            'previews': previews[]-> ${storylistPreviewQuery},
            'cards': cards[]-> ${storylistCardQuery}
        }[0]`;

	const result = await client.fetch(query, {});
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
