// Sanity
import { getClient } from '../../_helpers/sanity-connector';

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
} from '../../sanity/types';
import { mapLandingPageContent, mapStoryNavigationTeaserWithAuthor } from '../../_utils/functions';
import { LandingPageContent, RotatingContent } from '@models/landing-page-content.model';

export async function fetchLandingPageContent(slug: string): Promise<LandingPageContentQueryResult> {
	return getClient().fetch(landingPageContentQuery, { slug });
}

export async function fetchLatestLandingPageReferences(): Promise<LatestLandingPageReferencesQueryResult> {
	return getClient().fetch(latestLandingPageReferencesQuery);
}

export async function fetchLandingPagesList(slugs: string[]): Promise<LandingPageListQueryResult> {
	return getClient().fetch(landingPageListQuery, { slugs });
}

export async function fetchRotatingContent(): Promise<RotatingContent> {
	const result = await getClient().fetch(rotatingContentQuery);
	if (!result) {
		throw new Error('Rotating content not found');
	}

	return { ...result, mostRead: mapStoryNavigationTeaserWithAuthor(result.mostRead) };
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
	return Promise.all(landingPageObjects.map((object) => getClient().create(object)));
}

// TODO: Rever estructura luego de migrar funciones de mapeo
export async function fetchAndMapLandingPageContent(slug: string): Promise<LandingPageContent> {
	const landingPageResult = await fetchLandingPageContent(slug);
	const rotatingContentResult = await fetchRotatingContent();

	if (!landingPageResult || !rotatingContentResult) {
		throw new Error('Landing page content not found');
	}

	return {
		...mapLandingPageContent({ ...landingPageResult, ...rotatingContentResult }),
	};
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

	await getClient()
		.patch(rotatingContent._id, { set: { mostRead: stories } })
		.commit();
}
