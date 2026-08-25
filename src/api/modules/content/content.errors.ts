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

// El contenido rotativo es otro documento, así que su curaduría rota merece su propio error: envuelto
// en el de la landing, el mensaje diría que está mal la semana cuando la semana está bien.
export class MalformedRotatingContentError extends Error {
	constructor(options?: { cause?: unknown }) {
		super('Rotating content is malformed', options);
		this.name = 'MalformedRotatingContentError';
	}
}
