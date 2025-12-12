// Sanity
import { InternalError } from '../../exceptions/exceptions';
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
	try {
		return await client.fetch(landingPageContentQuery, { slug });
	} catch (err) {
		throw new InternalError('Internal server error');
	}
}

export async function fetchLatestLandingPageReferences(): Promise<LatestLandingPageReferencesQueryResult> {
	try {
		return await client.fetch(latestLandingPageReferencesQuery);
	} catch (err) {
		throw new InternalError('Internal server error');
	}
}

export async function fetchLandingPagesList(slugs: string[]): Promise<LandingPageListQueryResult> {
	try {
		return await client.fetch(landingPageListQuery, { slugs });
	} catch (err) {
		console.error('Internal server error: ', err);
		throw new InternalError('Internal server error');
	}
}

export async function fetchRotatingContent(): Promise<RotatingContentQueryResult> {
	try {
		return await client.fetch(rotatingContentQuery);
	} catch (err) {
		console.error('Internal server error: ', err);
		throw new InternalError('Internal server error');
	}
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
	try {
		return Promise.all(landingPageObjects.map((object) => client.create(object)));
	} catch (err) {
		console.error('Internal server error: ', err);
		throw new InternalError('Internal server error');
	}
}

/**
 * Updates the mostRead stories in the rotating content document
 */
export async function updateRotatingContentMostRead(
	stories: Array<{ _key: string; _type: string; _ref: string }>,
): Promise<void | null> {
	try {
		const rotatingContent = await fetchRotatingContent();

		if (!rotatingContent) {
			return null;
		}

		await client.patch(rotatingContent._id, { set: { mostRead: stories } }).commit();
	} catch (err) {
		console.error('Internal server error: ', err);
		throw new InternalError('Internal server error');
	}
}
