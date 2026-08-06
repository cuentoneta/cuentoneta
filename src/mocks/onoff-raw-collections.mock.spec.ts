import {
	descriptionlessRawCollection,
	draftLikeRawCollection,
	emptyRawCollection,
	onoffRawCollectionsMock,
	onoffRawCollectionsWithFeaturedImage,
	onoffRawCollectionsWithoutFeaturedImage,
	onoffRawCollectionTeasersMock,
	sectionlessWorkRawCollection,
	shortSampleRawCollection,
} from './onoff-raw-collections.mock';
import { geometriasDelDesveloRawCollection } from './onoff/collection/geometrias-del-desvelo.collection.raw.mock';
import { inventarioDeLasPasionesRawCollection } from './onoff/collection/inventario-de-las-pasiones.collection.raw.mock';
import { onoffRawLiteraryWorksMock } from './onoff-raw-literary-works.mock';

describe('onoff raw collections mock', () => {
	// Que cada obra corresponda a una del canon es lo que impide que la derivación se despegue: sin
	// esta guarda, un recorte mal hecho produciría obras que no existen en ningún lado.
	it('derives every work from the raw corpus', () => {
		const canonIds = new Set(onoffRawLiteraryWorksMock.map((work) => work._id));

		onoffRawCollectionsMock.forEach((collection) => {
			expect(collection.literaryWorks.length).toBeGreaterThan(0);
			collection.literaryWorks.forEach((work) => expect(canonIds).toContain(work._id));
		});
	});

	// Se afirma qué sección es —la de apertura, por su clave— y no se recalcula el corte que la
	// derivación ya hace: comparar contra `content.slice(0, 1)` sería reescribir su cuerpo.
	it('projects a single opening section per work', () => {
		onoffRawCollectionsMock.forEach((collection) => {
			collection.literaryWorks.forEach((work) => {
				const canon = onoffRawLiteraryWorksMock.find((candidate) => candidate._id === work._id);

				expect(work.teaserSection).toHaveLength(1);
				expect(work.teaserSection[0]?._key).toBe(canon?.content[0]?._key);
				expect(work.sectionCount).toBe(canon?.content.length);
			});
		});
	});

	it('covers both branches of the featured image', () => {
		expect(geometriasDelDesveloRawCollection.featuredImage).not.toBeNull();
		expect(inventarioDeLasPasionesRawCollection.featuredImage).toBeNull();
		expect(onoffRawCollectionsWithFeaturedImage).toHaveLength(1);
		expect(onoffRawCollectionsWithoutFeaturedImage).toHaveLength(1);
	});

	it('derives teasers that carry the count and the first three covers', () => {
		expect(onoffRawCollectionTeasersMock).toHaveLength(onoffRawCollectionsMock.length);

		onoffRawCollectionTeasersMock.forEach((teaser, index) => {
			const collection = onoffRawCollectionsMock[index];

			expect(teaser._id).toBe(collection?._id);
			expect(teaser.count).toBe(collection?.literaryWorks.length);
			// Se afirma la propiedad que importa —a lo sumo tres portadas, y cada una la de su obra en la
			// misma posición— en vez de recalcular el corte, que sería reescribir la derivación.
			expect(teaser.literaryWorkCoverImages.length).toBeLessThanOrEqual(3);
			teaser.literaryWorkCoverImages.forEach((cover, position) => {
				expect(cover).toBe(collection?.literaryWorks[position]?.coverImage);
			});
			expect(teaser).not.toHaveProperty('literaryWorks');
		});
	});

	// Cada borde vale por su contraste con la colección de la que sale: afirmar solo el valor que el
	// spread escribe no puede fallar. Lo que estas aserciones protegen es que la **base** siga
	// cumpliendo lo contrario — si el canon dejara de tener obras, descripción o tres portadas, el
	// escenario dejaría de representar lo que su nombre dice y el spec del repository estaría
	// afirmando un error que ya no se produce.
	it('keeps every edge scenario meaningfully different from its base', () => {
		expect(geometriasDelDesveloRawCollection.literaryWorks.length).toBeGreaterThan(0);
		expect(emptyRawCollection.literaryWorks).toEqual([]);

		expect(inventarioDeLasPasionesRawCollection.literaryWorks.length).toBeGreaterThanOrEqual(3);
		expect(shortSampleRawCollection.literaryWorks.length).toBeLessThan(3);
		expect(shortSampleRawCollection.featuredImage).toBeNull();

		expect(geometriasDelDesveloRawCollection.description).not.toBe('');
		expect(descriptionlessRawCollection.description).toBe('');

		expect(geometriasDelDesveloRawCollection.literaryWorks[0]?.teaserSection.length).toBeGreaterThan(0);
		expect(sectionlessWorkRawCollection.literaryWorks[0]?.teaserSection).toEqual([]);

		expect(geometriasDelDesveloRawCollection.literaryWorks[0]?.totalReadingTime).not.toBeNull();
		expect(draftLikeRawCollection.literaryWorks[0]?.totalReadingTime).toBeNull();
	});

	// El borrador se distingue del dato mal curado en que lo único ausente es el reading time: si le
	// faltara algo más, el caso del repository dejaría de probar la rama que dice probar.
	it('keeps the draft-like scenario otherwise complete', () => {
		expect(draftLikeRawCollection.literaryWorks.map((work) => work._id)).toEqual(
			geometriasDelDesveloRawCollection.literaryWorks.map((work) => work._id),
		);
		expect(draftLikeRawCollection.literaryWorks[0]?.teaserSection).not.toEqual([]);
		expect(draftLikeRawCollection.literaryWorks[0]?.teaserSection[0]?.readingTime).not.toBeNull();
		expect(draftLikeRawCollection.description).not.toBe('');
	});
});
