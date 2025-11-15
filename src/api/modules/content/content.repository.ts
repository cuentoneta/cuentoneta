// Sanity
import { client } from '../../_helpers/sanity-connector';

// Queries
import {
	landingPageContentQuery,
	landingPageContentReferencesQuery,
	landingPageListQuery,
	rotatingContentQuery,
} from '../../_queries/content.query';
import {
	LandingPageContentQueryResult,
	LandingPageContentReferencesQueryResult,
	LandingPageListQueryResult,
	RotatingContentQueryResult,
} from '../../sanity/types';

/**
 * Fetches the landing page content for a specific week/year configuration
 */
export async function fetchLandingPageContent(slug: string): Promise<LandingPageContentQueryResult> {
	return client.fetch(landingPageContentQuery, { slug });
}

/**
 * Fetches the landing page content references for a specific week/year configuration
 */
export async function landingPageContentReferences(slug: string): Promise<LandingPageContentReferencesQueryResult> {
	return client.fetch(landingPageContentReferencesQuery, { slug });
}

/**
 * Fetches a list of landing page configurations that match the provided slugs
 */
export async function fetchLandingPageList(slugs: string[]): Promise<LandingPageListQueryResult> {
	return client.fetch(landingPageListQuery, { slugs });
}

/**
 * Fetches the rotating content singleton document
 */
export async function fetchRotatingContent(): Promise<RotatingContentQueryResult> {
	return client.fetch(rotatingContentQuery);
}

/**
 * Creates multiple landing page documents in parallel
 */

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
