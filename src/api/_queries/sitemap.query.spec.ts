import { evaluate, parse } from 'groq-js';
import {
	onoffAuthorDocumentsMock,
	onoffCollectionDocumentsMock,
	onoffLiteraryWorkDocumentsMock,
} from '@mocks/onoff-documents.mock';
import { withoutKey } from '@mocks/onoff/document/sanity-document.factory';

import { sitemapSlugsQuery } from './sitemap.query';

interface SitemapSlugs {
	literaryWorks: { slug: string; lastmod: string }[];
	authors: { slug: string; lastmod: string }[];
	collections: { slug: string; lastmod: string }[];
}

async function run(dataset: unknown[]): Promise<SitemapSlugs> {
	const result = await evaluate(parse(sitemapSlugsQuery), { dataset });
	return (await result.get()) as SitemapSlugs;
}

const [canonAuthor] = onoffAuthorDocumentsMock;
const [canonLiteraryWork] = onoffLiteraryWorkDocumentsMock;
const [canonCollection] = onoffCollectionDocumentsMock;

// El canon guarda la misma fecha en las dos marcas, así que un documento que distinga entre ambas se
// deriva acá: es la condición que estos casos necesitan y que el corpus no tiene por qué traer.
const WRITE_DATE = '2026-08-13T06:07:43Z';
const touched = <T extends object>(document: T): T => ({ ...document, _updatedAt: WRITE_DATE });

describe('sitemapSlugsQuery', () => {
	// Una escritura operativa —un backfill, una migración, una copia de dataset— mueve la fecha de
	// escritura de todo el corpus a la vez. El sitemap no debe reflejarla.
	it.each([
		['literaryWorks' as const, touched(withoutKey(canonLiteraryWork, 'publishedAt'))],
		['authors' as const, touched(canonAuthor)],
		['collections' as const, touched(canonCollection)],
	])('derives the %s lastmod from the creation date, not the write date', async (type, document) => {
		const [entry] = (await run([document]))[type];

		expect(entry?.lastmod).toBe(document._createdAt);
		expect(entry?.lastmod).not.toBe(document._updatedAt);
	});

	it('prefers the publication date over the creation date for a literary work', async () => {
		const [entry] = (await run([canonLiteraryWork])).literaryWorks;

		expect(entry?.lastmod).toBe(canonLiteraryWork.publishedAt);
	});

	it.each([
		['literaryWorks' as const, canonLiteraryWork],
		['authors' as const, canonAuthor],
		['collections' as const, canonCollection],
	])('leaves %s drafts out', async (type, document) => {
		const draft = { ...document, _id: `drafts.${document?._id}` };

		expect((await run([draft]))[type]).toEqual([]);
	});

	it.each([
		['literaryWorks' as const, canonLiteraryWork],
		['authors' as const, canonAuthor],
		['collections' as const, canonCollection],
	])('projects the %s slug flat', async (type, document) => {
		const [entry] = (await run([document]))[type];

		expect(entry?.slug).toBe(document?.slug?.current);
	});
});
