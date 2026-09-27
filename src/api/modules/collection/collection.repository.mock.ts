import type { Collection, CollectionTeaser } from '@models/collection.model';
import type { CollectionRepository, CollectionTeaserListing } from './collection.repository';

// Fake de almacenamiento: sustituye el content lake por una lista en memoria, con la misma semántica
// de búsqueda. El listado deriva sus teasers de las colecciones cargadas para que no puedan discrepar
// de lo que devuelve la búsqueda por slug.
export class InMemoryCollectionRepository implements CollectionRepository {
	private readonly collections: ReadonlyArray<Collection>;

	constructor(collections: ReadonlyArray<Collection> = []) {
		this.collections = collections;
	}

	public async fetchBySlug(slug: string): Promise<Collection | null> {
		return this.collections.find((collection) => collection.slug === slug) ?? null;
	}

	// Carga dominio ya construido, así que no tiene descartes que reportar.
	public async fetchAll(): Promise<CollectionTeaserListing> {
		const collections: CollectionTeaser[] = this.collections.map((collection) => ({ ...collection, literaryWorks: [] }));
		return { collections, malformed: [] };
	}
}
