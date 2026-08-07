import { evaluate, parse } from 'groq-js';
import {
	configlessCollectionDocument,
	coverlessLiteraryWorkDocument,
	draftCollectionDocument,
	emptyCollectionDocument,
	multiSectionCollectionDocument,
	multiSectionLiteraryWorkDocument,
	onoffCollectionDocumentsMock,
	onoffDatasetMock,
} from '@mocks/onoff-documents.mock';

import { collectionBySlugQuery, collectionsQuery } from './collection.query';

async function run(query: string, dataset: unknown[], params: Record<string, unknown> = {}) {
	const result = await evaluate(parse(query), { dataset, params });
	return result.get();
}

const dataset = onoffDatasetMock;

const [firstCollection] = onoffCollectionDocumentsMock;

describe('collectionBySlugQuery', () => {
	it('resolves the collection whose slug matches the parameter', async () => {
		const result = await run(collectionBySlugQuery, dataset, { slug: firstCollection?.slug.current });

		expect(result).toMatchObject({ _id: firstCollection?._id, slug: firstCollection?.slug.current });
	});

	it('resolves null when no collection carries the slug', async () => {
		expect(await run(collectionBySlugQuery, dataset, { slug: 'inexistente' })).toBeNull();
	});

	// El sitio público sirve solo contenido publicado; un borrador que se colara acá lo expondría. El
	// dataset lleva **solo** el borrador: con la publicada al lado, el caso podría pasar por el orden
	// en que la query las encuentra en vez de por el filtro.
	it('leaves drafts out', async () => {
		const result = await run(collectionBySlugQuery, [draftCollectionDocument], {
			slug: draftCollectionDocument.slug?.current,
		});

		expect(result).toBeNull();
	});

	// No acotar el listado es la precondición de la invariante `count`, que el agregado deriva de las
	// obras que transporta: un slice acá la volvería silenciosamente el tamaño de la página.
	it('carries every literary work, uncapped', async () => {
		const result = await run(collectionBySlugQuery, dataset, { slug: firstCollection?.slug.current });

		expect((result as { literaryWorks: unknown[] }).literaryWorks).toHaveLength(
			firstCollection?.literaryWorks?.length ?? 0,
		);
	});

	it('projects the opening section alone, not the whole body', async () => {
		const withMultiSection = [...dataset, multiSectionLiteraryWorkDocument, multiSectionCollectionDocument];

		const result = await run(collectionBySlugQuery, withMultiSection, { slug: 'multi-seccion' });
		const [work] = (result as { literaryWorks: { teaserSection: unknown[]; sectionCount: number }[] }).literaryWorks;

		expect(work?.teaserSection).toHaveLength(1);
		expect(work?.sectionCount).toBe(multiSectionLiteraryWorkDocument.content.length);
	});

	it('defaults showAuthors to false when the config is absent', async () => {
		const result = await run(collectionBySlugQuery, [...dataset, configlessCollectionDocument], {
			slug: configlessCollectionDocument.slug.current,
		});

		expect((result as { config: { showAuthors: boolean } }).config.showAuthors).toBe(false);
	});
});

describe('collectionsQuery', () => {
	it('counts the works without dereferencing them', async () => {
		const result = (await run(collectionsQuery, dataset)) as Record<string, unknown>[];
		const target = result.find((collection) => collection['_id'] === firstCollection?._id);

		expect(target?.['count']).toBe(firstCollection?.literaryWorks?.length);
		expect(target).not.toHaveProperty('literaryWorks');
	});

	// La rama `sample` de imagery necesita exactamente tres portadas, y solo esas tres se resuelven.
	// Se afirma contra los objetos de imagen de las obras referenciadas, que es la forma real.
	it('resolves the cover of the first three works alone', async () => {
		const result = (await run(collectionsQuery, dataset)) as { _id: string; literaryWorkCoverImages: unknown[] }[];
		const target = result.find((collection) => collection._id === firstCollection?._id);

		expect(target?.literaryWorkCoverImages).toHaveLength(Math.min(3, firstCollection?.literaryWorks?.length ?? 0));
		target?.literaryWorkCoverImages.forEach((cover) => expect(cover).toMatchObject({ _type: 'image' }));
	});

	it('yields an empty cover list for a collection without works', async () => {
		const result = (await run(collectionsQuery, [...dataset, emptyCollectionDocument])) as {
			_id: string;
			count: number;
			literaryWorkCoverImages: unknown[];
		}[];
		const target = result.find((collection) => collection._id === emptyCollectionDocument._id);

		expect(target?.count).toBe(0);
		expect(target?.literaryWorkCoverImages).toEqual([]);
	});

	// La obra sin portada es una rama que el tipo declara opcional y que el canon nunca ejercitó.
	it('projects null for a work that carries no cover', async () => {
		const collection = {
			...firstCollection,
			_id: 'sin-portada',
			slug: { _type: 'slug' as const, current: 'sin-portada' },
			literaryWorks: [{ _key: 'k', _type: 'reference' as const, _ref: coverlessLiteraryWorkDocument._id }],
		};

		const result = (await run(collectionsQuery, [...dataset, collection, coverlessLiteraryWorkDocument])) as {
			_id: string;
			literaryWorkCoverImages: unknown[];
		}[];
		const target = result.find((entry) => entry._id === collection._id);

		expect(target?.literaryWorkCoverImages).toEqual([null]);
	});

	// El orden esperado se aproxima con `localeCompare('es')`: GROQ ordena por collation, no por unidades
	// UTF-16, así que un `sort()` pelado divergiría ante el primer título acentuado.
	it('orders by title ascending and leaves drafts out', async () => {
		const withDraft = [...dataset, draftCollectionDocument];

		const result = (await run(collectionsQuery, withDraft)) as { title: string }[];
		const expected = onoffCollectionDocumentsMock
			.map((collection) => collection.title)
			.sort((a, b) => a.localeCompare(b, 'es'));

		expect(result.map(({ title }) => title)).toEqual(expected);
	});
});
