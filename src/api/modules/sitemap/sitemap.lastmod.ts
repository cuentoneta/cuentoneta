import type { DateString } from '@utils/date.utils';

/**
 * Fecha en que cambió el contenido de todas las páginas de cada tipo: es el piso de su `lastmod`.
 *
 * Se mueve cuando la plantilla de la página cambia de forma sustancial y visible, o cuando se reescribe
 * en lote un contenido que no tiene fecha editorial propia —las biografías de autor, la descripción de
 * una colección—. No se mueve por backfills, migraciones ni correcciones menores, y nunca para forzar
 * un rastreo: un `lastmod` que avanza sin que la página cambie le enseña al buscador a ignorar la
 * señal. Una obra nueva no lo requiere, porque mueve el `lastmod` de su autor y de sus colecciones con
 * su propia fecha; sumar a una colección una obra con fecha anterior, en cambio, cambia la página sin
 * moverlo.
 *
 * Todas las páginas de un tipo comparten esta fecha por diseño, y por eso el smoke de indexado la exime
 * del chequeo de concentración. Va en `YYYY-MM-DD` porque `resolveLastmod` compara lexicográficamente.
 */
export const PAGE_REVISED_ON = Object.freeze({
	author: '2026-08-31',
	collection: '2026-08-31',
} satisfies Record<string, DateString>);

export type RevisedPage = keyof typeof PAGE_REVISED_ON;

/** El tipo de página con revisión declarada al que pertenece una ruta, o `undefined` si no pertenece a ninguno. */
export function revisedPageOf(path: string): RevisedPage | undefined {
	const prefixes = { author: '/author/', collection: '/collection/' } satisfies Record<RevisedPage, string>;
	return (Object.keys(prefixes) as RevisedPage[]).find((page) => path.startsWith(prefixes[page]));
}

/**
 * El `lastmod` de una página que lista obras: la fecha de la más reciente, salvo que la plantilla de la
 * página sea posterior. `latestLiteraryWorkDate` llega en `YYYY-MM-DD` y `undefined` si la página no
 * lista ninguna obra.
 */
export function resolveLastmod(latestLiteraryWorkDate: string | undefined, revisedOn: DateString): string {
	return latestLiteraryWorkDate && latestLiteraryWorkDate > revisedOn ? latestLiteraryWorkDate : revisedOn;
}
