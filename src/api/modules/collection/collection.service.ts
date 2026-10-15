import type { Collection, CollectionTeaser } from '@models/collection.model';
import { CollectionNotFoundError } from './collection.errors';
import type { CollectionRepository } from './collection.repository';
import { SanityCollectionRepository } from './collection.repository.sanity';
import { rankSuggestedCollections } from './collection-suggestions';

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

/**
 * Sugiere hasta `limit` colecciones para la que se está leyendo, ordenadas por cercanía con ella y
 * sin incluirla. Un slug que el catálogo no trae lanza `CollectionNotFoundError`, igual que el
 * detalle.
 */
export async function getSuggestedCollections(
	slug: string,
	limit: number,
	repository: CollectionRepository = new SanityCollectionRepository(),
): Promise<readonly CollectionTeaser[]> {
	const collections = await getCollections(repository);
	const target = collections.find((collection) => collection.slug === slug);
	if (!target) {
		throw new CollectionNotFoundError(slug);
	}
	return rankSuggestedCollections(target, collections, limit);
}
