import type { SanityClient } from '@sanity/client';
import { clearAllMocks, fn } from '@test-utils';
import { collectionBySlugQuery, collectionsQuery } from '../../_queries/collection.query';
import {
	descriptionlessRawCollection,
	draftLikeRawCollection,
	emptyRawCollection,
	onoffRawCollectionsWithFeaturedImage,
	onoffRawCollectionsWithoutFeaturedImage,
	onoffRawCollectionTeasersMock,
	sectionlessWorkRawCollection,
	shortSampleRawCollection,
} from '@mocks/onoff-raw-collections.mock';
import { MalformedCollectionError } from './collection.errors';
import { SanityCollectionRepository } from './collection.repository.sanity';

// Se piden por capacidad y no por nombre: el caso necesita "una con portada editorial", no una
// colección puntual del canon.
const [withFeaturedImage] = onoffRawCollectionsWithFeaturedImage;
const [withoutFeaturedImage] = onoffRawCollectionsWithoutFeaturedImage;

// El repository solo hace `fetch`, así que el doble del client implementa solo eso y se inyecta por el
// seam del constructor. Devuelve también el spy, para poder observar con qué query se lo llamó.
function repoWith(raw: unknown) {
	const fetch = fn(() => Promise.resolve(raw));
	const repository = new SanityCollectionRepository({ fetch } as unknown as SanityClient);
	return { repository, fetch };
}

function repoReturning(raw: unknown): SanityCollectionRepository {
	return repoWith(raw).repository;
}

beforeEach(() => {
	clearAllMocks();
});

// Un cruce de queries devolvería datos de la forma equivocada sin que ninguna aserción sobre el
// resultado lo note: las dos proyectan la misma entidad.
describe('SanityCollectionRepository query selection', () => {
	it('asks for the by-slug query, passing the slug as a parameter', async () => {
		const { repository, fetch } = repoWith(withFeaturedImage);

		await repository.fetchBySlug('geometrias-del-desvelo');

		expect(fetch).toHaveBeenCalledWith(collectionBySlugQuery, { slug: 'geometrias-del-desvelo' });
	});

	it('asks for the listing query', async () => {
		const { repository, fetch } = repoWith(onoffRawCollectionTeasersMock);

		await repository.fetchAll();

		expect(fetch).toHaveBeenCalledWith(collectionsQuery);
	});
});

describe('SanityCollectionRepository.fetchBySlug', () => {
	it('maps the raw result into a frozen aggregate', async () => {
		const collection = await repoReturning(withFeaturedImage).fetchBySlug('geometrias-del-desvelo');

		expect(Object.isFrozen(collection)).toBe(true);
		expect(collection?.slug).toBe(withFeaturedImage.slug);
		expect(collection?.title).toBe(withFeaturedImage.title);
	});

	it('resolves null when the slug carries no collection', async () => {
		expect(await repoReturning(null).fetchBySlug('inexistente')).toBeNull();
	});

	// Derivarlo en la factory es lo que lo ata a las obras que el agregado transporta.
	it('derives the count from the works it carries', async () => {
		const collection = await repoReturning(withFeaturedImage).fetchBySlug('geometrias-del-desvelo');

		expect(collection?.count).toBe(withFeaturedImage.literaryWorks.length);
		expect(collection?.literaryWorks).toHaveLength(withFeaturedImage.literaryWorks.length);
	});

	it('runs the description through the sanitization pipeline', async () => {
		const collection = await repoReturning(withFeaturedImage).fetchBySlug('geometrias-del-desvelo');

		expect(collection?.description).toContain('<p>');
	});

	it('takes the editorial cover when the collection has one', async () => {
		const collection = await repoReturning(withFeaturedImage).fetchBySlug('geometrias-del-desvelo');

		expect(collection?.imagery.kind).toBe('representative');
	});

	// La mitad de las colecciones no tiene portada propia: el abanico sale de sus obras. Se afirma el
	// contenido y no el largo, que la tupla ya garantiza — un abanico de las obras equivocadas pasaría
	// una aserción de largo sin problema.
	it('falls back to a sample of the works covers', async () => {
		const collection = await repoReturning(withoutFeaturedImage).fetchBySlug('inventario-de-las-pasiones');
		const expected = collection?.literaryWorks.slice(0, 3).map((work) => work.coverImage);

		expect(collection?.imagery.kind).toBe('sample');
		expect(collection?.imagery.kind === 'sample' && collection.imagery.images).toEqual(expected);
		expect(expected?.every((url) => url !== '')).toBe(true);
	});

	it('maps each work into a teaser with its opening section', async () => {
		const collection = await repoReturning(withFeaturedImage).fetchBySlug('geometrias-del-desvelo');
		const [work] = collection?.literaryWorks ?? [];

		expect(work?.teaserSection.position).toBe(0);
		expect(work?.teaserSection.bodyHtml).toContain('<p>');
		expect(work?.authors.length).toBeGreaterThan(0);
	});

	it('copies the persisted reading time of each work', async () => {
		const collection = await repoReturning(withFeaturedImage).fetchBySlug('geometrias-del-desvelo');

		expect(collection?.literaryWorks.map((work) => work.totalReadingTime)).toEqual(
			withFeaturedImage.literaryWorks.map((work) => work.totalReadingTime),
		);
	});

	// El opcional del tipo solo se da en borradores, que el sitio público no sirve: no es un dato mal
	// curado, así que no lanza. Cae al tiempo de la sección de apertura, prefiriendo su valor
	// persistido: afirmarlo contra ese valor —y no contra "algo mayor que cero", que la factory ya
	// garantiza— es lo que distingue esta rama de cualquier otro número válido.
	it('falls back to the opening section reading time', async () => {
		const collection = await repoReturning(draftLikeRawCollection).fetchBySlug('geometrias-del-desvelo');
		const [work] = collection?.literaryWorks ?? [];

		expect(work?.totalReadingTime).toBe(work?.teaserSection.readingTime);
		expect(work?.totalReadingTime).toBe(draftLikeRawCollection.literaryWorks[0]?.teaserSection[0]?.readingTime);
	});
});

describe('SanityCollectionRepository malformed data', () => {
	it('rejects a collection without works', async () => {
		await expect(repoReturning(emptyRawCollection).fetchBySlug('geometrias-del-desvelo')).rejects.toThrow(
			MalformedCollectionError,
		);
	});

	// Sin portada propia y con menos de tres obras el abanico es inconstruible; rellenar con cadenas
	// vacías era lo que colaba portadas rotas a la interfaz.
	it('rejects a sample that cannot reach three covers', async () => {
		await expect(repoReturning(shortSampleRawCollection).fetchBySlug('inventario-de-las-pasiones')).rejects.toThrow(
			MalformedCollectionError,
		);
	});

	it('rejects a collection without a description', async () => {
		await expect(repoReturning(descriptionlessRawCollection).fetchBySlug('geometrias-del-desvelo')).rejects.toThrow(
			MalformedCollectionError,
		);
	});

	it('rejects a work without an opening section', async () => {
		await expect(repoReturning(sectionlessWorkRawCollection).fetchBySlug('geometrias-del-desvelo')).rejects.toThrow(
			MalformedCollectionError,
		);
	});

	// Preservar la causa es lo que permite diagnosticar cuál de las invariantes se rompió.
	it('preserves the original cause', async () => {
		await expect(
			repoReturning(descriptionlessRawCollection).fetchBySlug('geometrias-del-desvelo'),
		).rejects.toMatchObject({ cause: expect.any(Error) });
	});

	// Un listado que esconde el elemento roto es un bug de datos que nadie ve: se cae entero, con el
	// primer elemento sano por delante para que no pase por casualidad.
	it('brings down the whole listing instead of filtering the bad collection out', async () => {
		const [sane, ...rest] = onoffRawCollectionTeasersMock;
		const dataset = [sane, { ...rest[0], count: 0 }];

		await expect(repoReturning(dataset).fetchAll()).rejects.toThrow(MalformedCollectionError);
	});
});

describe('SanityCollectionRepository.fetchAll', () => {
	it('maps every teaser of the listing', async () => {
		const teasers = await repoReturning(onoffRawCollectionTeasersMock).fetchAll();

		expect(teasers).toHaveLength(onoffRawCollectionTeasersMock.length);
		expect(teasers.map(({ slug }) => slug)).toEqual(onoffRawCollectionTeasersMock.map(({ slug }) => slug));
	});

	// Lo que distingue al teaser: muestra la colección sin transportar sus obras.
	it('carries the count but no works', async () => {
		const teasers = await repoReturning(onoffRawCollectionTeasersMock).fetchAll();

		expect(teasers.map((teaser) => teaser.literaryWorks)).toEqual(onoffRawCollectionTeasersMock.map(() => []));
		expect(teasers.map((teaser) => teaser.count)).toEqual(onoffRawCollectionTeasersMock.map((teaser) => teaser.count));
	});

	it('resolves both branches of imagery from the projected covers', async () => {
		const teasers = await repoReturning(onoffRawCollectionTeasersMock).fetchAll();

		expect(teasers.map(({ imagery }) => imagery.kind)).toEqual(['representative', 'sample']);
	});

	// Es la invariante "al menos una obra" sobre lo único que el teaser transporta.
	it('rejects a teaser whose count is zero', async () => {
		const [teaser] = onoffRawCollectionTeasersMock;

		await expect(repoReturning([{ ...teaser, count: 0 }]).fetchAll()).rejects.toThrow(MalformedCollectionError);
	});

	// Un catálogo sin colecciones es un resultado legítimo, no un fallo.
	it('resolves an empty listing without failing', async () => {
		expect(await repoReturning([]).fetchAll()).toEqual([]);
	});
});
