import { onoffCollectionsMock, onoffCollectionTeasersMock } from '@mocks/onoff-collections.mock';
import { restoreAllMocks, spyOn } from '@test-utils';
import {
	CollectionNotFoundError,
	MalformedCollectionCatalogError,
	MalformedCollectionError,
} from './collection.errors';
import type { CollectionRepository, CollectionTeaserListing } from './collection.repository';
import { InMemoryCollectionRepository } from './collection.repository.mock';
import { getCollectionBySlug, getCollections } from './collection.service';

const repository = new InMemoryCollectionRepository(onoffCollectionsMock);
const [firstCollection] = onoffCollectionsMock;

afterEach(() => restoreAllMocks());

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
		const warn = spyOn(console, 'warn').mockImplementation(() => undefined);

		expect(await getCollections(new InMemoryCollectionRepository())).toEqual([]);
		expect(warn).not.toHaveBeenCalled();
	});
});

// Devuelve un listado canned con `malformed` poblado: el doble en memoria carga dominio ya construido
// y nunca produce esa rama, así que la política de descarte solo se puede ejercitar con un stub.
class StubCollectionRepository implements CollectionRepository {
	constructor(private readonly listing: CollectionTeaserListing) {}

	public async fetchBySlug(): Promise<never> {
		throw new Error('No participa de estos casos.');
	}

	public async fetchAll(): Promise<CollectionTeaserListing> {
		return this.listing;
	}
}

describe('getCollections with malformed collections', () => {
	const [sane] = onoffCollectionTeasersMock;

	it('serves the sane collections and logs the discarded one', async () => {
		const warn = spyOn(console, 'warn').mockImplementation(() => undefined);
		const malformed = new MalformedCollectionError('una-coleccion-rota', { cause: new Error('abanico corto') });
		const stub = new StubCollectionRepository({ collections: [sane], malformed: [malformed] });

		expect(await getCollections(stub)).toEqual([sane]);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('una-coleccion-rota'), malformed.cause);
	});

	// Sin filtro, un vacío con documentos presentes afirmaría que no hay colecciones publicadas.
	it('fails instead of serving an empty catalog when none can be built', async () => {
		const warn = spyOn(console, 'warn').mockImplementation(() => undefined);
		const malformed = [new MalformedCollectionError('una'), new MalformedCollectionError('otra')];
		const stub = new StubCollectionRepository({ collections: [], malformed });

		await expect(getCollections(stub)).rejects.toThrow(MalformedCollectionCatalogError);
		await expect(getCollections(stub)).rejects.toMatchObject({ malformed });
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('"una"'), undefined);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('"otra"'), undefined);
	});
});
