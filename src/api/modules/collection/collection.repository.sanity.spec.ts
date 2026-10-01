import type { SanityClient } from '@sanity/client';
import { clearAllMocks, fn } from '@test-utils';
import { collectionBySlugQuery, collectionsQuery } from '../../_queries/collection.query';
import {
	descriptionlessRawCollection,
	emptyRawCollection,
	onoffRawCollectionsWithFeaturedImage,
	onoffRawCollectionsWithLinkedDescription,
	onoffRawCollectionTeasersWithLinkedDescription,
	onoffRawCollectionsWithoutFeaturedImage,
	onoffRawCollectionTeasersMock,
	onoffRawCollectionTeasersWithoutFeaturedImage,
	sectionlessWorkRawCollection,
	unbackfilledWorkRawCollection,
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

	it('maps each work into a teaser with its excerpt', async () => {
		const collection = await repoReturning(withFeaturedImage).fetchBySlug('geometrias-del-desvelo');
		const [work] = collection?.literaryWorks ?? [];

		expect(work?.excerpt.bodyHtml).toContain('<p>');
		expect(work?.authors.length).toBeGreaterThan(0);
	});

	// La ausencia de estos campos es lo que impide que alguien vuelva a derivar el tiempo de lectura de
	// una obra a partir de un cuerpo recortado. Se afirma sobre el objeto que el ACL entrega, no solo
	// sobre el tipo, porque el tipo no viaja al runtime.
	it('does not expose reading time nor position in the excerpt', async () => {
		const collection = await repoReturning(withFeaturedImage).fetchBySlug('geometrias-del-desvelo');
		const [work] = collection?.literaryWorks ?? [];

		expect(work?.excerpt).not.toHaveProperty('readingTime');
		expect(work?.excerpt).not.toHaveProperty('position');
	});

	it('copies the persisted reading time of each work', async () => {
		const collection = await repoReturning(withFeaturedImage).fetchBySlug('geometrias-del-desvelo');

		expect(collection?.literaryWorks.map((work) => work.totalReadingTime)).toEqual(
			withFeaturedImage.literaryWorks.map((work) => work.totalReadingTime),
		);
	});

	// Las dos ramas que lanzan. Ninguna se da con los datos publicados de hoy; se afirman igual, porque
	// son los dos únicos caminos por los que el ACL prefiere caerse antes que inventar un número o
	// servir un extracto en blanco.
	it('rejects a work without a persisted total reading time', async () => {
		await expect(repoReturning(unbackfilledWorkRawCollection).fetchBySlug('geometrias-del-desvelo')).rejects.toThrow(
			MalformedCollectionError,
		);
	});

	it('rejects a work whose excerpt carries no body', async () => {
		const [first] = onoffRawCollectionsWithFeaturedImage;
		const raw = {
			...first,
			literaryWorks: first.literaryWorks.map((work, index) =>
				index === 0 ? { ...work, excerpt: [{ ...work.excerpt[0], body: null }] } : work,
			),
		};

		await expect(repoReturning(raw).fetchBySlug('geometrias-del-desvelo')).rejects.toThrow(MalformedCollectionError);
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

	// El slug viaja como dato y no solo en el mensaje: es lo que el registro de un descarte necesita.
	it('names the malformed collection', async () => {
		await expect(
			repoReturning(descriptionlessRawCollection).fetchBySlug('geometrias-del-desvelo'),
		).rejects.toMatchObject({ slug: descriptionlessRawCollection.slug });
	});
});

describe('SanityCollectionRepository.fetchAll', () => {
	it('maps every teaser of the listing', async () => {
		const { collections: teasers, malformed } = await repoReturning(onoffRawCollectionTeasersMock).fetchAll();

		expect(teasers).toHaveLength(onoffRawCollectionTeasersMock.length);
		expect(teasers.map(({ slug }) => slug)).toEqual(onoffRawCollectionTeasersMock.map(({ slug }) => slug));
		expect(malformed).toEqual([]);
	});

	// La colección rota va en el medio y no en un borde, para que un corte al primer error o un
	// descarte del último no pasen por casualidad.
	it('keeps the sane collections and reports the one it cannot build', async () => {
		const brokenIndex = Math.floor(onoffRawCollectionTeasersMock.length / 2);
		const broken = onoffRawCollectionTeasersMock[brokenIndex];
		const dataset = onoffRawCollectionTeasersMock.map((teaser, index) =>
			index === brokenIndex ? { ...teaser, count: 0 } : teaser,
		);

		const { collections, malformed } = await repoReturning(dataset).fetchAll();

		expect(collections.map(({ slug }) => slug)).toEqual(
			onoffRawCollectionTeasersMock.filter((_, index) => index !== brokenIndex).map(({ slug }) => slug),
		);
		expect(malformed).toHaveLength(1);
		expect(malformed[0]).toMatchObject({ slug: broken.slug });
	});

	// Lo que distingue al teaser: muestra la colección sin transportar sus obras.
	it('carries the count but no works', async () => {
		const { collections: teasers } = await repoReturning(onoffRawCollectionTeasersMock).fetchAll();

		expect(teasers.map((teaser) => teaser.literaryWorks)).toEqual(onoffRawCollectionTeasersMock.map(() => []));
		expect(teasers.map((teaser) => teaser.count)).toEqual(onoffRawCollectionTeasersMock.map((teaser) => teaser.count));
	});

	// Fija dónde vive la decisión: la prosa del teaser sale sin enlaces desde la traducción, no desde
	// quien la renderiza.
	it('strips the links of the description, keeping their text', async () => {
		const { collections: teasers } = await repoReturning(onoffRawCollectionTeasersWithLinkedDescription).fetchAll();

		expect(teasers.map(({ description }) => description).join()).not.toContain('<a');
		teasers.forEach(({ description }) => expect(description).toContain('La Cuentoneta'));
	});

	// La contracara: la vista completa no se pinta dentro de nada, así que ahí el enlace es legítimo y
	// tiene que sobrevivir. Sin este caso, descartarlo en las dos vistas pasaría inadvertido.
	it('keeps the links of the description in the full view', async () => {
		const [raw] = onoffRawCollectionsWithLinkedDescription;
		const collection = await repoReturning(raw).fetchBySlug(raw.slug);

		expect(collection?.description).toContain('href="https://www.cuentoneta.ar/about"');
	});

	// Se afirma que las dos ramas quedan cubiertas, sin atarse al orden: el listado llega ordenado por
	// título, que es un criterio de la query y no de este mapeo.
	it('resolves both branches of imagery from the projected covers', async () => {
		const { collections: teasers } = await repoReturning(onoffRawCollectionTeasersMock).fetchAll();

		expect(new Set(teasers.map(({ imagery }) => imagery.kind))).toEqual(new Set(['representative', 'sample']));
	});

	// Es la invariante "al menos una obra" sobre lo único que el teaser transporta. La factory lanza un
	// error propio, así que el reporte lo envuelve para nombrar la colección.
	it('reports a teaser whose count is zero as malformed', async () => {
		const [teaser] = onoffRawCollectionTeasersMock;

		const { collections, malformed } = await repoReturning([{ ...teaser, count: 0 }]).fetchAll();

		expect(collections).toEqual([]);
		expect(malformed).toHaveLength(1);
		expect(malformed[0]).toBeInstanceOf(MalformedCollectionError);
		expect(malformed[0]).toMatchObject({ slug: teaser.slug, cause: expect.any(Error) });
	});

	// Cuando la ACL ya lanzó el error de dominio, se reporta tal cual: envolverlo otra vez escondería
	// la causa real detrás de una capa sin información.
	it('reports an error the translation already raised without wrapping it', async () => {
		const [teaser] = onoffRawCollectionTeasersWithoutFeaturedImage;
		const shortSample = { ...teaser, literaryWorkCoverImages: teaser.literaryWorkCoverImages.slice(0, 2) };

		const { malformed } = await repoReturning([shortSample]).fetchAll();

		expect(malformed).toHaveLength(1);
		expect(malformed[0]).toMatchObject({ slug: teaser.slug });
		expect(malformed[0]?.cause).toBeUndefined();
	});

	// Un catálogo sin colecciones es un resultado legítimo, no un fallo.
	it('resolves an empty listing without failing', async () => {
		expect(await repoReturning([]).fetchAll()).toEqual({ collections: [], malformed: [] });
	});
});
