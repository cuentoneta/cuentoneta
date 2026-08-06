import { onoffCollectionsMock } from '@mocks/onoff-collections.mock';
import { CollectionNotFoundError } from './collection.errors';
import { InMemoryCollectionRepository } from './collection.repository.mock';
import { getCollectionBySlug, getCollections, getCollectionTeasers } from './collection.service';

const repository = new InMemoryCollectionRepository(onoffCollectionsMock);
const [firstCollection] = onoffCollectionsMock;

describe('getCollectionBySlug', () => {
	it('resolves the collection carrying the slug', async () => {
		const collection = await getCollectionBySlug(firstCollection?.slug ?? '', repository);

		expect(collection.slug).toBe(firstCollection?.slug);
		expect(collection.literaryWorks).toEqual(firstCollection?.literaryWorks);
	});

	// Es lo único que el service decide: para el repository la ausencia es un resultado válido.
	it('translates the absence into a typed error', async () => {
		await expect(getCollectionBySlug('inexistente', repository)).rejects.toThrow(CollectionNotFoundError);
	});

	it('names the slug in the error', async () => {
		await expect(getCollectionBySlug('inexistente', repository)).rejects.toThrow(/inexistente/);
	});
});

describe('getCollections', () => {
	it('resolves every collection', async () => {
		expect(await getCollections(repository)).toHaveLength(onoffCollectionsMock.length);
	});

	// Una colección vacía de colecciones es un resultado legítimo, no un 404.
	it('resolves an empty listing without failing', async () => {
		expect(await getCollections(new InMemoryCollectionRepository())).toEqual([]);
	});
});

describe('getCollectionTeasers', () => {
	it('resolves teasers that carry no works', async () => {
		const teasers = await getCollectionTeasers(repository);

		expect(teasers).toHaveLength(onoffCollectionsMock.length);
		teasers.forEach((teaser) => expect(teaser.literaryWorks).toEqual([]));
	});

	it('preserves the count of each collection', async () => {
		const teasers = await getCollectionTeasers(repository);

		teasers.forEach((teaser, index) => expect(teaser.count).toBe(onoffCollectionsMock[index]?.count));
	});
});
