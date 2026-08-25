export class LandingPageNotFoundError extends Error {
	constructor(slug: string) {
		super(`Landing page with slug "${slug}" not found`);
		this.name = 'LandingPageNotFoundError';
	}
}

// Se distingue de "la semana no existe" porque son dos problemas distintos: acá la landing está en el
// content lake pero su contenido curado no permite construir el dominio, así que merece un status
// propio en vez de confundirse con un 404.
export class MalformedLandingPageError extends Error {
	constructor(slug: string, options?: { cause?: unknown }) {
		super(`Landing page with slug "${slug}" is malformed`, options);
		this.name = 'MalformedLandingPageError';
	}
}

export class RotatingContentNotFoundError extends Error {
	constructor() {
		super('Rotating content not found');
		this.name = 'RotatingContentNotFoundError';
	}
}
