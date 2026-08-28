/**
 * Reconocimiento de los assets que sirve el CDN de Sanity, y la respuesta con la que los e2e los
 * sustituyen.
 *
 * El CDN factura ancho de banda y una corrida completa pide las mismas portadas muchas veces —un
 * proyecto por browser, contexto nuevo por test, sin cache HTTP entre ellos—, así que ninguna sale
 * a la red. Núcleo puro, sin dependencia de Playwright: quien lo instala es el fixture de `test.ts`.
 */

const SANITY_CDN_HOSTNAME = 'cdn.sanity.io';

/**
 * Verdadero solo si `url` es absoluta y su host es exactamente el del CDN. Compara el hostname
 * parseado y no el texto de la URL, porque `https://cdn.sanity.io.evil.com/x.png` contiene el
 * string sin ser el CDN. Una URL relativa o mal formada da `false`.
 */
export function isSanityAssetUrl(url: string): boolean {
	try {
		return new URL(url).hostname === SANITY_CDN_HOSTNAME;
	} catch {
		return false;
	}
}

// El CDN nombra cada asset de imagen con sus dimensiones antes de la extensión
// (`<hash>-1024x1536.png`), y esa es la única fuente de la relación de aspecto disponible sin
// descargar el archivo.
const ASSET_DIMENSIONS = /-(\d+)x(\d+)\.[a-z0-9]+$/i;

const FALLBACK_DIMENSIONS = { width: 1, height: 1 };

function dimensionsOf(url: string): { width: number; height: number } {
	try {
		const [, width, height] = ASSET_DIMENSIONS.exec(new URL(url).pathname) ?? [];
		return width && height ? { width: Number(width), height: Number(height) } : FALLBACK_DIMENSIONS;
	} catch {
		return FALLBACK_DIMENSIONS;
	}
}

export const PLACEHOLDER_CONTENT_TYPE = 'image/svg+xml';

/**
 * Imagen transparente con la que se responde el asset de `url`, del mismo tamaño que el original.
 *
 * Las dimensiones no son cosmética: las portadas se pintan con `h-auto`, así que el navegador
 * deriva su alto de la relación de aspecto de la imagen que llegó. Un sustituto cuadrado las achica,
 * la página se acorta y los specs que miden geometría —el apilamiento contra la barra— fallan por
 * la sustitución en vez de por lo que miden. Un SVG vacío las lleva porque declara su tamaño en el
 * documento, sin tener que generar un raster por cada medida.
 */
export function placeholderFor(url: string): string {
	const { width, height } = dimensionsOf(url);
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"/>`;
}
