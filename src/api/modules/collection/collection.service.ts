import type { Collection, CollectionTeaser } from '@models/collection.model';
import { CollectionNotFoundError, MalformedCollectionCatalogError } from './collection.errors';
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
): Promise<readonly CollectionTeaser[]> {
	const { collections, malformed } = await repository.fetchAll();
	// Descartar es una política de listado y no de traducción: una colección que el CMS dejó
	// inconsistente no debe llevarse puestas a las demás. Se registra antes de decidir, para que aun
	// en la caída total quede cada slug que hay que ir a corregir.
	for (const error of malformed) {
		console.warn(`[Collection] Colección descartada del catálogo: "${error.slug}"`, error.cause);
	}
	// A diferencia del listado de obras, el catálogo no tiene filtro: el vacío solo es verdad si no
	// había documentos que traducir.
	if (collections.length === 0 && malformed.length > 0) {
		throw new MalformedCollectionCatalogError(malformed);
	}
	return collections;
}
