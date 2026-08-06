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

// El listado no tiene ausencia que traducir: un catálogo sin colecciones es un resultado legítimo, no
// un 404. Devuelve teasers, que es la vista que la página de catálogo muestra.
export async function getCollections(
	repository: CollectionRepository = new SanityCollectionRepository(),
): Promise<CollectionTeaser[]> {
	return repository.fetchAll();
}
