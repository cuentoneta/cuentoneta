import {
	descriptionlessRawCollection,
	draftLikeRawCollection,
	emptyRawCollection,
	geometriasDelDesveloRawCollection,
	inventarioDeLasPasionesRawCollection,
	onoffRawCollectionsMock,
	onoffRawCollectionsWithFeaturedImage,
	onoffRawCollectionsWithoutFeaturedImage,
	onoffRawCollectionTeasersMock,
	sectionlessWorkRawCollection,
	shortSampleRawCollection,
} from './onoff-raw-collections.mock';
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

	it('projects a single opening section per work', () => {
		onoffRawCollectionsMock.forEach((collection) => {
			collection.literaryWorks.forEach((work) => {
				const canon = onoffRawLiteraryWorksMock.find((candidate) => candidate._id === work._id);

				expect(work.teaserSection).toEqual(canon?.content.slice(0, 1));
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
			expect(teaser.literaryWorkCoverImages).toEqual(
				collection?.literaryWorks.slice(0, 3).map((work) => work.coverImage),
			);
			expect(teaser).not.toHaveProperty('literaryWorks');
		});
	});

	// Cada borde tiene que seguir cumpliendo lo que su nombre promete: si el canon cambia y alguno deja
	// de ser el caso que dice ser, el spec del repository afirmaría un error que ya no se produce.
	it('keeps every edge scenario true to its name', () => {
		expect(emptyRawCollection.literaryWorks).toEqual([]);
		expect(shortSampleRawCollection.featuredImage).toBeNull();
		expect(shortSampleRawCollection.literaryWorks).toHaveLength(2);
		expect(descriptionlessRawCollection.description).toBe('');
		expect(sectionlessWorkRawCollection.literaryWorks[0]?.teaserSection).toEqual([]);
		expect(draftLikeRawCollection.literaryWorks[0]?.totalReadingTime).toBeNull();
	});

	// El borrador se distingue del dato mal curado en que lo único ausente es el reading time.
	it('keeps the draft-like scenario otherwise complete', () => {
		expect(draftLikeRawCollection.literaryWorks).toHaveLength(geometriasDelDesveloRawCollection.literaryWorks.length);
		expect(draftLikeRawCollection.literaryWorks[0]?.teaserSection).not.toEqual([]);
		expect(draftLikeRawCollection.description).not.toBe('');
	});
});
