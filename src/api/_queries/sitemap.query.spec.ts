import { evaluate, parse } from 'groq-js';
import {
	emptyCollectionDocument,
	onoffAuthorDocumentsMock,
	onoffCollectionDocumentsMock,
	onoffDatasetMock,
	onoffLiteraryWorkDocumentsMock,
} from '@mocks/onoff-documents.mock';

import { sitemapSlugsQuery } from './sitemap.query';

interface SitemapSlugs {
	literaryWorks: { slug: string; lastmod: string }[];
	authors: { slug: string; latestLiteraryWorkAt: string | null }[];
	collections: { slug: string; latestLiteraryWorkAt: string | null }[];
}

async function run(dataset: unknown[]): Promise<SitemapSlugs> {
	const result = await evaluate(parse(sitemapSlugsQuery), { dataset });
	return (await result.get()) as SitemapSlugs;
}

const [canonAuthor] = onoffAuthorDocumentsMock;
const [canonLiteraryWork] = onoffLiteraryWorkDocumentsMock;
const [canonCollection] = onoffCollectionDocumentsMock;

// Las dos condiciones que estos casos necesitan y que el corpus no tiene por qué traer: una fecha de
// escritura distinta de la de creación, y una obra sin fecha de publicación. `coalesce` saltea el nulo
// igual que la ausencia del campo, así que alcanza con anularlo.
const WRITE_DATE = '2026-08-13T06:07:43Z';
const touched = <T extends object>(document: T): T => ({ ...document, _updatedAt: WRITE_DATE });
const unpublished = <T extends object>(document: T): T => ({ ...document, publishedAt: null });

describe('sitemapSlugsQuery', () => {
	// Una escritura operativa —un backfill, una migración, una copia de dataset— mueve la fecha de
	// escritura de todo el corpus a la vez. El sitemap no debe reflejarla.
	it('derives the literary work lastmod from the creation date, not the write date', async () => {
		const document = touched(unpublished(canonLiteraryWork));

		const [entry] = (await run([document])).literaryWorks;

		expect(entry?.lastmod).toBe(document._createdAt);
		expect(entry?.lastmod).not.toBe(document._updatedAt);
	});

	it('prefers the publication date over the creation date for a literary work', async () => {
		const [entry] = (await run([canonLiteraryWork])).literaryWorks;

		expect(entry?.lastmod).toBe(canonLiteraryWork.publishedAt);
	});

	// El dataset no guarda la fecha en nulo: guarda el documento sin el campo. `coalesce` trata los dos
	// casos igual, y este los mantiene a los dos afirmados.
	it('falls back to the creation date when the publication date is absent', async () => {
		const { publishedAt, ...withoutPublishedAt } = canonLiteraryWork;
		void publishedAt;

		const [entry] = (await run([withoutPublishedAt])).literaryWorks;

		expect(entry?.lastmod).toBe(canonLiteraryWork._createdAt);
	});

	it.each([
		['literaryWorks' as const, canonLiteraryWork],
		['authors' as const, canonAuthor],
		['collections' as const, canonCollection],
	])('leaves %s drafts out', async (type, document) => {
		const draft = { ...document, _id: `drafts.${document?._id}` };

		expect((await run([draft]))[type]).toEqual([]);
	});

	const canonByType = [
		['literaryWorks' as const, canonLiteraryWork],
		['authors' as const, canonAuthor],
		['collections' as const, canonCollection],
	] as const;
	const withSlug = <T extends object>(document: T, current: string): T => ({
		...document,
		slug: { _type: 'slug', current },
	});

	describe.each(canonByType)('for %s', (type, document) => {
		it.each(['IcyFox', '-lead', 'trail-', 'el--aleph'])('leaves the malformed slug %j out', async (slug) => {
			expect((await run([withSlug(document, slug)]))[type]).toEqual([]);
		});

		it('leaves a document without slug out', async () => {
			const { slug, ...withoutSlug } = document;
			void slug;

			expect((await run([withoutSlug]))[type]).toEqual([]);
		});

		// GROQ no puede expresar el alfabeto del slug: esta brecha es la que obliga al repository a
		// filtrar de nuevo con la regla del dominio. Si la poda la cubriera, esa guarda sobraría.
		it('lets a slug outside the alphabet through, for the repository to drop', async () => {
			expect((await run([withSlug(document, 'foo_bar')]))[type]).toHaveLength(1);
		});
	});

	it.each(canonByType)('projects the %s slug flat', async (type, document) => {
		const [entry] = (await run([document]))[type];

		expect(entry?.slug).toBe(document?.slug?.current);
	});

	// El dataset va en orden inverso al de los identificadores: si la query no ordenara, el resultado
	// saldría en el orden del array y el caso no distinguiría las dos conductas.
	it.each(canonByType)('orders %s by identifier', async (type, document) => {
		const ids = [`${document._id}-b`, `${document._id}-a`];
		const dataset = ids.map((_id, index) => ({ ...withSlug(document, `orden-${index}`), _id }));

		const slugs = (await run(dataset))[type].map(({ slug }) => slug);

		expect(slugs).toEqual(['orden-1', 'orden-0']);
	});
});

describe('sitemapSlugsQuery — latest literary work of the pages that list them', () => {
	const reference = (_id: string) => ({ _key: _id, _type: 'reference' as const, _ref: _id });

	// Posterior a todo el canon.
	const LATER = '2026-09-01T10:00:00Z';
	const laterLiteraryWork = (authorId: string) => ({
		...canonLiteraryWork,
		_id: 'onoff-literary-work-posterior',
		slug: { _type: 'slug' as const, current: 'obra-posterior' },
		publishedAt: LATER,
		authors: [reference(authorId)],
	});

	const latestAmong = (ids: string[]) =>
		onoffLiteraryWorkDocumentsMock
			.filter(({ _id }) => ids.includes(_id))
			.map(({ publishedAt, _createdAt }) => publishedAt ?? _createdAt)
			.sort()
			.at(-1);

	const authorLatest = latestAmong(
		onoffLiteraryWorkDocumentsMock
			.filter(({ authors }) => authors?.some(({ _ref }) => _ref === canonAuthor._id))
			.map(({ _id }) => _id),
	);
	const collectionLatest = latestAmong(canonCollection.literaryWorks?.map(({ _ref }) => _ref) ?? []);

	async function latestFor(listing: 'authors' | 'collections', slug: string | undefined, dataset: unknown[]) {
		return (await run(dataset))[listing].find((entry) => entry.slug === slug)?.latestLiteraryWorkAt;
	}

	describe('of an author', () => {
		const latestOfCanonAuthor = (dataset: unknown[]) => latestFor('authors', canonAuthor.slug.current, dataset);

		it('projects the date of their most recent literary work', async () => {
			// Sin obras del autor en el canon el caso pasaría comparando `null` con `undefined`.
			expect(authorLatest).toBeDefined();

			expect(await latestOfCanonAuthor(onoffDatasetMock)).toBe(authorLatest);
		});

		it('projects a later literary work', async () => {
			expect(await latestOfCanonAuthor([...onoffDatasetMock, laterLiteraryWork(canonAuthor._id)])).toBe(LATER);
		});

		it('projects null for an author without literary works', async () => {
			expect(await latestOfCanonAuthor([canonAuthor])).toBeNull();
		});

		it.each([
			['a draft', { ...laterLiteraryWork(canonAuthor._id), _id: 'drafts.onoff-literary-work-posterior' }],
			['a literary work of another author', laterLiteraryWork(`${canonAuthor._id}-otro`)],
		])('ignores %s', async (_description, document) => {
			expect(await latestOfCanonAuthor([...onoffDatasetMock, document])).toBe(authorLatest);
		});
	});

	describe('of a collection', () => {
		const latestOfCanonCollection = (dataset: unknown[]) =>
			latestFor('collections', canonCollection.slug?.current, dataset);
		const withoutCanonCollection = onoffDatasetMock.filter((document) => document !== canonCollection);

		it('projects the date of the most recent literary work it lists', async () => {
			expect(collectionLatest).toBeDefined();

			expect(await latestOfCanonCollection(onoffDatasetMock)).toBe(collectionLatest);
		});

		it('projects a later literary work it lists', async () => {
			const literaryWork = laterLiteraryWork(canonAuthor._id);
			const listing = {
				...canonCollection,
				literaryWorks: [...(canonCollection.literaryWorks ?? []), reference(literaryWork._id)],
			};

			expect(await latestOfCanonCollection([...withoutCanonCollection, listing, literaryWork])).toBe(LATER);
		});

		it('ignores a later literary work it does not list', async () => {
			const dataset = [...onoffDatasetMock, laterLiteraryWork(canonAuthor._id)];

			expect(await latestOfCanonCollection(dataset)).toBe(collectionLatest);
		});

		it('projects null for a collection that lists no literary work', async () => {
			const dataset = [...onoffDatasetMock, emptyCollectionDocument];

			expect(await latestFor('collections', emptyCollectionDocument.slug?.current, dataset)).toBeNull();
		});
	});
});
