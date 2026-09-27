export class CollectionNotFoundError extends Error {
	constructor(slug: string) {
		super(`Collection with slug "${slug}" not found`);
		this.name = 'CollectionNotFoundError';
	}
}

// Se distingue de "el slug no existe" porque son dos problemas distintos: acá la colección está en el
// content lake pero sus datos no permiten construir el agregado, así que merece un status propio en
// vez de confundirse con un 404. Nombra a la colección culpable y preserva la causa, que es lo que
// después vuelve útil el registro de un descarte.
export class MalformedCollectionError extends Error {
	constructor(
		public readonly slug: string,
		options?: { cause?: unknown },
	) {
		super(`Collection with slug "${slug}" is malformed`, options);
		this.name = 'MalformedCollectionError';
	}
}

// Había colecciones para el catálogo y no se pudo construir ninguna: no hay una culpable sino un
// listado sin nada que servir. `malformed` trae cada descarte, con su slug y su causa.
export class MalformedCollectionCatalogError extends Error {
	constructor(public readonly malformed: readonly MalformedCollectionError[]) {
		super(`No collection of the catalog could be built (${malformed.length} malformed)`);
		this.name = 'MalformedCollectionCatalogError';
	}
}
