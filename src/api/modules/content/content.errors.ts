/** La semana pedida no está cargada en el content lake. */
export class LandingPageNotFoundError extends Error {
	constructor(slug: string) {
		super(`Landing page with slug "${slug}" not found`);
		this.name = 'LandingPageNotFoundError';
	}
}

/**
 * La semana existe, pero su contenido curado no permite construir el dominio.
 *
 * Es un problema distinto del anterior y por eso merece un status propio: uno se corrige cargando la
 * semana y el otro corrigiendo lo que ya se cargó.
 */
export class MalformedLandingPageError extends Error {
	constructor(slug: string, options?: { cause?: unknown }) {
		super(`Landing page with slug "${slug}" is malformed`, options);
		this.name = 'MalformedLandingPageError';
	}
}

/** El documento de contenido rotativo no está instalado. */
export class RotatingContentNotFoundError extends Error {
	constructor() {
		super('Rotating content not found');
		this.name = 'RotatingContentNotFoundError';
	}
}

/**
 * El contenido rotativo existe, pero su contenido curado no permite construir el dominio.
 *
 * Lleva error propio y no el de la landing porque es otro documento: envuelto en aquél, el mensaje
 * culparía a una semana que está bien.
 */
export class MalformedRotatingContentError extends Error {
	constructor(options?: { cause?: unknown }) {
		super('Rotating content is malformed', options);
		this.name = 'MalformedRotatingContentError';
	}
}
