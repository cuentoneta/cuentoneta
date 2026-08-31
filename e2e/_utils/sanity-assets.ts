/**
 * La respuesta con la que los e2e sustituyen los assets que sirve el CDN de Sanity.
 *
 * El CDN factura ancho de banda y una corrida completa pide las mismas portadas muchas veces —un
 * proyecto por browser, contexto nuevo por test, sin cache HTTP entre ellos—, así que se sustituyen
 * en todo spec que no lo desactive; el opt-out y su justificación viven en `test.ts`, que es quien
 * instala la intercepción.
 *
 * Núcleo puro, sin dependencia de Playwright. El reconocimiento de la URL no se declara acá sino en
 * el kernel (`@utils/sanity-image.utils`), compartido con el `IMAGE_LOADER` de la aplicación: si los
 * tests sustituyeran un conjunto distinto del que la aplicación transforma, el bloqueo pasaría en
 * verde sin cubrir lo que se pide de verdad.
 */

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
 * la página se acorta y los specs que miden geometría fallan por la sustitución en vez de por lo que
 * miden. Un SVG vacío lleva su tamaño declarado en el documento, sin tener que generar un raster por
 * cada medida.
 *
 * Un asset sin dimensiones en el nombre —los `/files/*`, que no son imágenes— cae a 1×1: no hay
 * layout que preservar.
 */
export function placeholderFor(url: string): string {
	const { width, height } = dimensionsOf(url);
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"/>`;
}
