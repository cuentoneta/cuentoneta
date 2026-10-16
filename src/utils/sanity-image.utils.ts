const SANITY_CDN_HOSTNAME = 'cdn.sanity.io';

/**
 * Verdadero solo si `url` es una URL absoluta servida por el CDN de Sanity.
 *
 * Compartido a propósito: el loader de la aplicación decide con esto qué transforma y la
 * intercepción de los e2e qué sustituye, y dos definiciones que divergieran dejarían a los tests
 * cubriendo un conjunto distinto del que la aplicación pide.
 *
 * Compara el hostname parseado y no el texto, porque `https://cdn.sanity.io.evil.com/x.png` lo
 * contiene sin ser el CDN.
 */
export function isSanityImageUrl(url: string): boolean {
	try {
		const { hostname, protocol } = new URL(url);
		return hostname === SANITY_CDN_HOSTNAME && protocol === 'https:';
	} catch {
		return false;
	}
}

// Parámetros de transformación del CDN de Sanity que la UI agrega sobre una URL ya resuelta.
export type SanityImageParams = {
	w?: number;
	h?: number;
	auto?: 'format';
	/** Calidad de recompresión, 0–100. Sin él, el CDN aplica la suya. */
	q?: number;
	/** Formato de salida forzado; sin él, el CDN sirve el formato del original. */
	fm?: 'jpg' | 'png' | 'webp';
};

/**
 * Agrega parámetros de transformación a una URL de imagen de Sanity respetando la query string
 * existente. Las URLs con crop aplicado en el Studio ya vienen con `?rect=...`; concatenar un
 * segundo `?` corrompe el valor de `rect` y el CDN responde 400. El separador se elige según la
 * URL ya tenga o no query string.
 */
export function withSanityImageParams(url: string, params: SanityImageParams): string {
	if (!url) {
		return url;
	}
	const query = Object.entries(params)
		.filter(([, value]) => value !== undefined)
		.map(([key, value]) => `${key}=${value}`)
		.join('&');
	if (!query) {
		return url;
	}
	const separator = url.includes('?') ? '&' : '?';
	return `${url}${separator}${query}`;
}

export type SearchImage = {
	/** URL absoluta del CDN, convertida a JPG. */
	url: string;
	/** Ancho × alto en píxeles de lo que sirve `url`; ausente si la URL no permite deducirlo. */
	pixelArea?: number;
};

/**
 * Resuelve la imagen que una página declara a los buscadores a partir de la URL de un asset de Sanity:
 * el original convertido a JPG, sin redimensionar. Devuelve `undefined` cuando la URL no es del CDN o el
 * asset es un SVG, que los buscadores no usan como miniatura y que en el sitio es la portada genérica:
 * en ambos casos la página no tiene una imagen propia que declarar.
 */
export function resolveSearchImage(url: string): SearchImage | undefined {
	if (!isSanityImageUrl(url)) {
		return undefined;
	}
	const parsed = new URL(url);
	if (parsed.pathname.toLowerCase().endsWith('.svg')) {
		return undefined;
	}
	const pixelArea = cropPixelArea(parsed.searchParams.get('rect')) ?? assetPixelArea(parsed.pathname);
	return {
		url: withSanityImageParams(url, { fm: 'jpg' }),
		...(pixelArea !== undefined ? { pixelArea } : {}),
	};
}

// `rect` es `x,y,ancho,alto`: el recorte aplicado en el Studio, que es lo que el CDN sirve en lugar
// del original.
function cropPixelArea(rect: string | null): number | undefined {
	const [, , width, height] = rect?.split(',').map(Number) ?? [];
	return isPositiveInteger(width) && isPositiveInteger(height) ? width * height : undefined;
}

function assetPixelArea(pathname: string): number | undefined {
	// Nombre de un asset de imagen en el CDN: `<hash>-<ancho>x<alto>.<extensión>`.
	const assetDimensionsPattern = /-(\d+)x(\d+)\.[a-z0-9]+$/i;
	const match = assetDimensionsPattern.exec(pathname);
	return match ? Number(match[1]) * Number(match[2]) : undefined;
}

function isPositiveInteger(value: number | undefined): value is number {
	return value !== undefined && Number.isInteger(value) && value > 0;
}
