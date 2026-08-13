import { evaluate, parse } from 'groq-js';
import {
	legacyStoryDocument,
	legacyStorylistDocument,
	onoffAuthorDocumentsMock,
	undatedLegacyStoryDocument,
} from '@mocks/onoff-documents.mock';

import { sitemapSlugsQuery } from './sitemap.query';

interface SitemapSlugs {
	stories: { slug: string; lastmod: string }[];
	authors: { slug: string; lastmod: string }[];
	storylists: { slug: string; lastmod: string }[];
}

async function run(dataset: unknown[]): Promise<SitemapSlugs> {
	const result = await evaluate(parse(sitemapSlugsQuery), { dataset });
	return (await result.get()) as SitemapSlugs;
}

const [canonAuthor] = onoffAuthorDocumentsMock;

// Los tres tipos que el sitemap publica, con su fecha de escritura distinta de la de creación.
const touchedAuthorDocument = { ...canonAuthor, _updatedAt: legacyStoryDocument._updatedAt };

describe('sitemapSlugsQuery', () => {
	// Una escritura operativa —un backfill, una migración, una copia de dataset— mueve la fecha de
	// escritura de todo el corpus a la vez. El sitemap no debe reflejarla.
	it.each([
		['stories' as const, undatedLegacyStoryDocument],
		['authors' as const, touchedAuthorDocument],
		['storylists' as const, legacyStorylistDocument],
	])('derives the %s lastmod from the creation date, not the write date', async (type, document) => {
		const [entry] = (await run([document]))[type];

		expect(entry?.lastmod).toBe(document._createdAt);
		expect(entry?.lastmod).not.toBe(document._updatedAt);
	});

	it('prefers the publication date over the creation date for a story', async () => {
		const [entry] = (await run([legacyStoryDocument])).stories;

		expect(entry?.lastmod).toBe(legacyStoryDocument.publishedAt);
	});

	it.each([
		['stories' as const, legacyStoryDocument],
		['authors' as const, canonAuthor],
		['storylists' as const, legacyStorylistDocument],
	])('leaves %s drafts out', async (type, document) => {
		const draft = { ...document, _id: `drafts.${document?._id}` };

		expect((await run([draft]))[type]).toEqual([]);
	});

	it.each([
		['stories' as const, legacyStoryDocument],
		['authors' as const, canonAuthor],
		['storylists' as const, legacyStorylistDocument],
	])('projects the %s slug flat', async (type, document) => {
		const [entry] = (await run([document]))[type];

		expect(entry?.slug).toBe(document?.slug?.current);
	});
});
