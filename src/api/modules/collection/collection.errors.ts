export class CollectionNotFoundError extends Error {
	constructor(slug: string) {
		super(`Collection with slug "${slug}" not found`);
		this.name = 'CollectionNotFoundError';
	}
}

// Se distingue de "el slug no existe" porque son dos problemas distintos: acá la colección está en el
// content lake pero sus datos no permiten construir el agregado, así que merece un status propio en
// vez de confundirse con un 404.
export class MalformedCollectionError extends Error {
	constructor(slug: string, options?: { cause?: unknown }) {
		super(`Collection with slug "${slug}" is malformed`, options);
		this.name = 'MalformedCollectionError';
	}
}
