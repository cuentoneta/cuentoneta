export class LiteraryWorkNotFoundError extends Error {
	constructor(slug: string) {
		super(`LiteraryWork with slug "${slug}" not found`);
		this.name = 'LiteraryWorkNotFoundError';
	}
}

// Una obra que no puede construirse como teaser (sin tiempo de lectura persistido o sin extracto) es
// un bug de datos: el listado entero falla en vez de servirse recortado en silencio. Mismo criterio
// que el módulo de colección, y igual que ahí, se distingue de "el slug no existe": son problemas
// distintos y merecen statuses distintos.
export class MalformedLiteraryWorkError extends Error {
	constructor(slug: string, options?: { cause?: unknown }) {
		super(`LiteraryWork with slug "${slug}" is malformed`, options);
		this.name = 'MalformedLiteraryWorkError';
	}
}
