import { evaluate, parse } from 'groq-js';
import {
	onoffAuthorDocumentsMock,
	onoffDatasetMock,
	onoffLiteraryWorkDocumentsMock,
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
const [canonWork] = onoffLiteraryWorkDocumentsMock;

// El corpus modela la era `LiteraryWork` y no tiene documentos `story`. Los dos de acá abajo se derivan
// de una obra del canon cambiándole el `_type`: para esta query los dos tipos son intercambiables
// —proyecta `slug.current`, `publishedAt` y `_createdAt`, que ambos schemas declaran igual—, así que la
// derivación ejercita la rama real sin inventar un documento. Lo que no prueba es el resto del schema
// de `story`, que esta query no toca.
const publishedStoryDocument = {
	...canonWork,
	_id: 'sitemap-story-publicada',
	_type: 'story',
	slug: { _type: 'slug' as const, current: 'sitemap-story-publicada' },
};

const unpublishedStoryDocument = (() => {
	const document = {
		...publishedStoryDocument,
		_id: 'sitemap-story-sin-fecha',
		slug: { _type: 'slug' as const, current: 'sitemap-story-sin-fecha' },
	};
	delete (document as { publishedAt?: string }).publishedAt;
	return document;
})();

describe('sitemapSlugsQuery', () => {
	// La regresión que motivó el cambio: una escritura operativa —un backfill, una migración, una copia
	// de dataset— mueve `_updatedAt` de todo el corpus a la misma fecha. Si `lastmod` derivara de ahí,
	// este caso fallaría.
	it('keeps lastmod still when _updatedAt moves', async () => {
		const touchedAuthor = { ...canonAuthor, _updatedAt: '2026-08-13T06:07:43Z' };

		const [entry] = (await run([touchedAuthor])).authors;

		expect(entry?.lastmod).toBe(canonAuthor?._createdAt);
	});

	it('prefers the publication date over the creation date for a story', async () => {
		const [entry] = (await run([publishedStoryDocument])).stories;

		expect(entry?.lastmod).toBe(publishedStoryDocument.publishedAt);
	});

	it('falls back to the creation date for a story with no publication date', async () => {
		const [entry] = (await run([unpublishedStoryDocument])).stories;

		expect(entry?.lastmod).toBe(unpublishedStoryDocument._createdAt);
	});

	it('leaves drafts out of every content type', async () => {
		const draft = { ...canonAuthor, _id: `drafts.${canonAuthor?._id}` };

		expect((await run([draft])).authors).toEqual([]);
	});

	it('carries every published author of the corpus', async () => {
		const { authors } = await run(onoffDatasetMock);

		expect(authors.map(({ slug }) => slug)).toEqual(onoffAuthorDocumentsMock.map((author) => author.slug?.current));
	});
});
