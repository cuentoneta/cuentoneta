/**
 * Lectura del XML de un sitemap para tests, sin dependencias de DOM.
 *
 * Vive acá y no en cada spec porque la usan dos capas —el spec del servicio y el e2e contra el
 * documento servido— y dos copias del mismo parseo divergen sin que nada avise.
 */

// Acepta prefijo de namespace y atributos: sin eso, un `<xhtml:link rel="alternate" …/>` o un
// `<image:image>` quedan invisibles y podrían emitirse fuera de secuencia sin que ningún caso falle.
const OPENING_TAG = /<([\w:]+)(?=[\s/>])/g;
const URL_BLOCK = /<url>([\s\S]*?)<\/url>/g;
const LOCATION = /<loc>(.*?)<\/loc>/g;

/** Los nombres de los elementos hijos de cada `<url>`, en el orden en que aparecen. */
export function childElementSequences(xml: string): string[][] {
	return [...xml.matchAll(URL_BLOCK)].map(([, block]) => [...block.matchAll(OPENING_TAG)].map(([, name]) => name));
}

export function locations(xml: string): string[] {
	return [...xml.matchAll(LOCATION)].map(([, loc]) => loc);
}
