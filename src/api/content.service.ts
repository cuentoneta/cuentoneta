// Sanity Client
import { client } from './_helpers/sanity-connector';

// Queries
import { storylistPreviewQuery } from './_queries/storylist.query';

export async function fetchLandingPageContent() {
	const query = `*[_type == 'landingPage'] {
            'previews': previews[]-> ${storylistPreviewQuery},
            'cards': cards[]-> ${storylistPreviewQuery}
        }[0]`;

	const result = await client.fetch(query, {});

	// TODO: Generar tipos correctos de respuestas
	return { previews: result.previews, cards: result.cards };
}
