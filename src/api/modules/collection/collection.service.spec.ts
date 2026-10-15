import { onoffCollectionsMock } from '@mocks/onoff-collections.mock';
import { CollectionNotFoundError } from './collection.errors';
import { InMemoryCollectionRepository } from './collection.repository.mock';
import { getCollectionBySlug, getCollections, getSuggestedCollections } from './collection.service';

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
	// El listado sirve la vista de catálogo: muestra cada colección sin transportar sus obras.
	it('resolves teasers that carry no works', async () => {
		const teasers = await getCollections(repository);

		expect(teasers).toHaveLength(onoffCollectionsMock.length);
		teasers.forEach((teaser) => expect(teaser.literaryWorks).toEqual([]));
	});

	it('preserves the count of each collection', async () => {
		const teasers = await getCollections(repository);

		teasers.forEach((teaser, index) => expect(teaser.count).toBe(onoffCollectionsMock[index]?.count));
	});

	// Un catálogo sin colecciones es un resultado legítimo, no un 404.
	it('resolves an empty listing without failing', async () => {
		expect(await getCollections(new InMemoryCollectionRepository())).toEqual([]);
	});
});

describe('getSuggestedCollections', () => {
	it('suggests collections other than the one being read, capped at the limit', async () => {
		const suggestions = await getSuggestedCollections(firstCollection?.slug ?? '', 3, repository);

		expect(suggestions).toHaveLength(3);
		expect(suggestions.map(({ slug }) => slug)).not.toContain(firstCollection?.slug);
	});

	it('ranks the collections sharing tags with the reference first', async () => {
		const suggestions = await getSuggestedCollections('geometrias-del-desvelo', 2, repository);

		expect(suggestions.map(({ slug }) => slug)).toEqual(['inventario-de-las-pasiones', 'cuadernos-del-meridien']);
	});

	// Es lo mismo que decide el detalle para un slug ausente, desde el mismo catálogo.
	it('translates an absent slug into a typed error', async () => {
		await expect(getSuggestedCollections('inexistente', 3, repository)).rejects.toThrow(CollectionNotFoundError);
	});

	it('serves fewer suggestions than the limit when the catalog runs out', async () => {
		const twoCollections = new InMemoryCollectionRepository(onoffCollectionsMock.slice(0, 2));

		expect(await getSuggestedCollections('geometrias-del-desvelo', 3, twoCollections)).toHaveLength(1);
	});

	it('serves an empty list when the catalog has no other collection', async () => {
		const singleCollection = new InMemoryCollectionRepository(onoffCollectionsMock.slice(0, 1));

		expect(await getSuggestedCollections('geometrias-del-desvelo', 3, singleCollection)).toEqual([]);
	});
});
