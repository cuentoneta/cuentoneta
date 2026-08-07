import { onoffRawCollectionsMock } from '../../onoff-raw-collections.mock';
import { onoffLiteraryWorkDocumentsMock } from '../literary-work/literary-work.document.projection';
import { onoffCollectionDocumentsMock } from '../../onoff-documents.mock';

describe('documento de collection', () => {
	// Si una referencia apuntara a un `_id` que no está en el dataset, la query la resolvería a null
	// sin fallar, y la colección saldría con menos obras de las que declara.
	it('references works that exist in the corpus', () => {
		const workIds = new Set(onoffLiteraryWorkDocumentsMock.map((work) => work._id));

		onoffCollectionDocumentsMock.forEach((collection) => {
			expect(collection.literaryWorks?.length).toBeGreaterThan(0);
			collection.literaryWorks?.forEach((reference) => expect(workIds).toContain(reference._ref));
		});
	});

	it('keeps the reference order the raw carries', () => {
		onoffCollectionDocumentsMock.forEach((collection, index) => {
			expect(collection.literaryWorks?.map((reference) => reference._ref)).toEqual(
				onoffRawCollectionsMock[index]?.literaryWorks.map((work) => work._id),
			);
		});
	});

	it('omits the featured image when the raw carries none', () => {
		const withoutCover = onoffCollectionDocumentsMock.find(
			(_, index) => onoffRawCollectionsMock[index]?.featuredImage === null,
		);

		expect(withoutCover).toBeDefined();
		expect(withoutCover).not.toHaveProperty('featuredImage');
	});

	it('keys every reference, which Sanity needs to edit the array', () => {
		expect(onoffCollectionDocumentsMock.length).toBeGreaterThan(0);
		onoffCollectionDocumentsMock.forEach((collection) => {
			expect(collection.literaryWorks?.length).toBeGreaterThan(0);
			collection.literaryWorks?.forEach((reference) => expect(reference._key).toBeTruthy());
		});
	});
});
