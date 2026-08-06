import type { Collection, CollectionTeaser } from '@models/collection.model';
import { CollectionNotFoundError } from './collection.errors';
import type { CollectionRepository } from './collection.repository';
import { SanityCollectionRepository } from './collection.repository.sanity';

// El repository es stateless, así que instanciarlo por llamada (default) no comparte estado.

// Traduce la ausencia a un error tipado, que es lo único que el repository no puede decidir: para él
// "no hay colección con ese slug" es un resultado válido, y recién en la capa de aplicación pasa a
// ser un fallo. La traducción del crudo al dominio ya ocurrió dentro del repository.
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

// Los listados no tienen ausencia que traducir: una colección vacía de colecciones es un resultado
// legítimo, no un 404.
export async function getCollections(
	repository: CollectionRepository = new SanityCollectionRepository(),
): Promise<Collection[]> {
	return repository.fetchAll();
}

export async function getCollectionTeasers(
	repository: CollectionRepository = new SanityCollectionRepository(),
): Promise<CollectionTeaser[]> {
	return repository.fetchTeasers();
}
