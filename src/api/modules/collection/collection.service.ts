import type { Collection, CollectionTeaser } from '@models/collection.model';
import { CollectionNotFoundError } from './collection.errors';
import type { CollectionRepository } from './collection.repository';
import { SanityCollectionRepository } from './collection.repository.sanity';

// El repository es stateless, así que instanciarlo por llamada (default) no comparte estado.

export async function getCollectionBySlug(
	slug: string,
	repository: CollectionRepository = new SanityCollectionRepository(),
): Promise<Collection> {
	const collection = await repository.fetchBySlug(slug);
	if (!collection) {
		throw new CollectionNotFoundError(slug);
	}
	return collection;
}

export async function getCollections(
	repository: CollectionRepository = new SanityCollectionRepository(),
): Promise<CollectionTeaser[]> {
	return repository.fetchAll();
}
