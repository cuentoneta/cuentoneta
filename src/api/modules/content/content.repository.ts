// Sanity
import { client } from '../../_helpers/sanity-connector';

// Queries
import {
	landingPageContentQuery,
	landingPageListQuery,
	latestLandingPageReferencesQuery,
	rotatingContentQuery,
} from '../../_queries/content.query';
import {
	LandingPageContentQueryResult,
	LandingPageListQueryResult,
	LatestLandingPageReferencesQueryResult,
	RotatingContentQueryResult,
} from '../../sanity/types';

export async function fetchLandingPageContent(slug: string): Promise<LandingPageContentQueryResult> {
	return client.fetch(landingPageContentQuery, { slug });
}

export async function fetchLatestLandingPageReferences(): Promise<LatestLandingPageReferencesQueryResult> {
	return client.fetch(latestLandingPageReferencesQuery);
}

export async function fetchLandingPagesList(slugs: string[]): Promise<LandingPageListQueryResult> {
	return client.fetch(landingPageListQuery, { slugs });
}

export async function fetchRotatingContent(): Promise<RotatingContentQueryResult> {
	return client.fetch(rotatingContentQuery);
}

export async function createLandingPages(
	landingPageObjects: Array<{
		_type: string;
		config: string;
		slug: { _type: string; current: string };
		campaigns: Array<{ _key: string; _type: string; _ref: string }>;
		cards: Array<{ _key: string; _type: string; _ref: string }>;
		latestReads: Array<{ _key: string; _type: string; _ref: string }>;
	}>,
) {
	return Promise.all(landingPageObjects.map((object) => client.create(object)));
}

/**
 * Updates the mostRead stories in the rotating content document
 */
export async function updateRotatingContentMostRead(
	stories: Array<{ _key: string; _type: string; _ref: string }>,
): Promise<void> {
	const rotatingContent = await fetchRotatingContent();
	if (!rotatingContent) {
		throw new Error('Rotating content not found');
	}

	await client.patch(rotatingContent._id, { set: { mostRead: stories } }).commit();
}
