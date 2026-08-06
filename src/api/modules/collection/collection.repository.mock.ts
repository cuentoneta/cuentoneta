import type { Collection, CollectionTeaser } from '@models/collection.model';
import type { CollectionRepository } from './collection.repository';

// Fake de almacenamiento: sustituye el content lake por una lista en memoria, con la misma semántica
// de búsqueda. Los teasers se derivan de las colecciones cargadas para que no puedan discrepar.
export class InMemoryCollectionRepository implements CollectionRepository {
	private readonly collections: ReadonlyArray<Collection>;

	constructor(collections: ReadonlyArray<Collection> = []) {
		this.collections = collections;
	}

	public async fetchBySlug(slug: string): Promise<Collection | null> {
		return this.collections.find((collection) => collection.slug === slug) ?? null;
	}

	public async fetchAll(): Promise<Collection[]> {
		return [...this.collections];
	}

	public async fetchTeasers(): Promise<CollectionTeaser[]> {
		return this.collections.map((collection) => ({ ...collection, literaryWorks: [] }));
	}
}
