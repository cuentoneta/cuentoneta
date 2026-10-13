import { evaluate, parse } from 'groq-js';
import {
	emptyCollectionDocument,
	migratedStoryDocument,
	onoffAuthorDocumentsMock,
	onoffCollectionDocumentsMock,
	onoffDatasetMock,
	onoffLiteraryWorkDocumentsMock,
	unmigratedStoryDocument,
} from '@mocks/onoff-documents.mock';
import { PAGE_REVISED_ON } from '@api/modules/sitemap/sitemap.lastmod';
import { shiftDays } from '@testing/date-shift';

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

type AuthorDocument = typeof canonAuthor;

const reference = (_id: string) => ({ _key: _id, _type: 'reference' as const, _ref: _id });
const asDraft = <T extends { _id: string }>(document: T): T => ({ ...document, _id: `drafts.${document._id}` });

// Posterior a todo el canon, y en la zona donde la fecha decide qué se publica: después de la revisión
// de la página.
const laterDay = shiftDays(PAGE_REVISED_ON.author, 1);

const laterLiteraryWork = (publishedAt: string, authors: AuthorDocument[] = [canonAuthor]) => ({
	...canonLiteraryWork,
	_id: 'onoff-literary-work-posterior',
	slug: { _type: 'slug' as const, current: 'obra-posterior' },
	publishedAt,
	authors: authors.map(({ _id }) => reference(_id)),
});

const latestDateAmong = (literaryWorks: typeof onoffLiteraryWorkDocumentsMock) =>
	literaryWorks
		.map(({ publishedAt, _createdAt }) => publishedAt ?? _createdAt)
		.sort()
		.at(-1);

describe('sitemapSlugsQuery — latest literary work of an author', () => {
	const otherAuthor = {
		...canonAuthor,
		_id: `${canonAuthor._id}-otro`,
		slug: { _type: 'slug' as const, current: 'otro-autor' },
	};

	const latestOf = (author: AuthorDocument) =>
		latestDateAmong(
			onoffLiteraryWorkDocumentsMock.filter(({ authors }) => authors?.some(({ _ref }) => _ref === author._id)),
		);

	async function latestFor(author: AuthorDocument, dataset: unknown[]) {
		const authors = (await run(dataset)).authors;
		return authors.find(({ slug }) => slug === author.slug.current)?.latestLiteraryWorkAt;
	}

	it('projects the date of the most recent literary work of the author', async () => {
		const expected = latestOf(canonAuthor);
		// Sin obras del autor en el canon el caso pasaría comparando `null` con `undefined`.
		expect(expected).toBeDefined();

		expect(await latestFor(canonAuthor, onoffDatasetMock)).toBe(expected);
	});

	it('projects null for an author without literary works', async () => {
		expect(await latestFor(canonAuthor, [canonAuthor])).toBeNull();
	});

	// El dataset guarda fechas con hora y fechas desnudas: las dos tienen que poder ganar.
	it.each([`${laterDay}T10:00:00Z`, laterDay])('projects a later literary work published on %s', async (date) => {
		expect(await latestFor(canonAuthor, [...onoffDatasetMock, laterLiteraryWork(date)])).toBe(date);
	});

	it('falls back to the creation date of a literary work without publication date', async () => {
		const createdAt = `${laterDay}T10:00:00Z`;
		const { publishedAt, ...withoutPublishedAt } = laterLiteraryWork(createdAt);
		void publishedAt;

		const dataset = [...onoffDatasetMock, { ...withoutPublishedAt, _createdAt: createdAt }];

		expect(await latestFor(canonAuthor, dataset)).toBe(createdAt);
	});

	// Cada uno es posterior al canon, así que si contara desplazaría la fecha esperada.
	it.each([
		['a draft', asDraft(laterLiteraryWork(laterDay))],
		['a migrated story', { ...migratedStoryDocument, publishedAt: laterDay }],
		['an unmigrated story', { ...unmigratedStoryDocument, publishedAt: laterDay }],
		['a literary work of another author', laterLiteraryWork(laterDay, [otherAuthor])],
	])('ignores %s', async (_description, document) => {
		const dataset = [...onoffDatasetMock, otherAuthor, document];

		expect(await latestFor(canonAuthor, dataset)).toBe(latestOf(canonAuthor));
	});

	it('counts a literary work for each of its authors', async () => {
		const dataset = [...onoffDatasetMock, otherAuthor, laterLiteraryWork(laterDay, [canonAuthor, otherAuthor])];

		expect(await latestFor(canonAuthor, dataset)).toBe(laterDay);
		expect(await latestFor(otherAuthor, dataset)).toBe(laterDay);
	});

	// Una escritura operativa sobre el autor —un backfill de biografías— no cambia lo que su página lista.
	it('ignores the write and creation dates of the author', async () => {
		const rewritten = { ...touched(canonAuthor), _createdAt: WRITE_DATE };
		const dataset = [...onoffDatasetMock.filter((document) => document !== canonAuthor), rewritten];

		expect(await latestFor(canonAuthor, dataset)).toBe(latestOf(canonAuthor));
	});
});

describe('sitemapSlugsQuery — latest literary work of a collection', () => {
	type CollectionDocument = typeof canonCollection;

	const referencedIds = canonCollection.literaryWorks?.map(({ _ref }) => _ref) ?? [];
	const canonLatest = latestDateAmong(onoffLiteraryWorkDocumentsMock.filter(({ _id }) => referencedIds.includes(_id)));

	// La colección del canon con la obra posterior sumada a su lista.
	const listingLaterLiteraryWork = {
		...canonCollection,
		literaryWorks: [...(canonCollection.literaryWorks ?? []), reference(laterLiteraryWork(laterDay)._id)],
	};

	const withoutCanonCollection = onoffDatasetMock.filter((document) => document !== canonCollection);

	async function latestFor(collection: CollectionDocument, dataset: unknown[]) {
		const collections = (await run(dataset)).collections;
		return collections.find(({ slug }) => slug === collection.slug?.current)?.latestLiteraryWorkAt;
	}

	it('projects the date of the most recent literary work the collection lists', async () => {
		// Sin obras listadas en el canon el caso pasaría comparando `null` con `undefined`.
		expect(canonLatest).toBeDefined();

		expect(await latestFor(canonCollection, onoffDatasetMock)).toBe(canonLatest);
	});

	it('projects null for a collection that lists no literary work', async () => {
		expect(await latestFor(emptyCollectionDocument, [...onoffDatasetMock, emptyCollectionDocument])).toBeNull();
	});

	it('projects a later literary work the collection lists', async () => {
		const dataset = [...withoutCanonCollection, listingLaterLiteraryWork, laterLiteraryWork(laterDay)];

		expect(await latestFor(canonCollection, dataset)).toBe(laterDay);
	});

	it('ignores a later literary work it does not list', async () => {
		const dataset = [...onoffDatasetMock, laterLiteraryWork(laterDay)];

		expect(await latestFor(canonCollection, dataset)).toBe(canonLatest);
	});

	it('ignores the draft of a literary work it lists', async () => {
		const dataset = [...withoutCanonCollection, listingLaterLiteraryWork, asDraft(laterLiteraryWork(laterDay))];

		expect(await latestFor(canonCollection, dataset)).toBe(canonLatest);
	});

	// Una escritura operativa sobre la colección no cambia lo que su página lista.
	it('ignores the write and creation dates of the collection', async () => {
		const rewritten = { ...touched(canonCollection), _createdAt: WRITE_DATE };

		expect(await latestFor(canonCollection, [...withoutCanonCollection, rewritten])).toBe(canonLatest);
	});
});
