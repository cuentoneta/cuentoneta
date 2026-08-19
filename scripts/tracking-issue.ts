/**
 * La plomería que comparten los jobs programados que mantienen un **issue de seguimiento**: cómo se
 * invoca `gh` y cómo se encuentra el issue por su título.
 *
 * Vive aparte porque los cuatro jobs la necesitan idéntica y lo que sigue —qué se reporta, cómo se
 * decide entre crear y actualizar, qué forma tiene la huella— difiere de verdad entre ellos. Unificar
 * también esa parte pediría un parámetro por cada diferencia; unificar solo la búsqueda no pide
 * ninguno.
 */
import { execFileSync } from 'node:child_process';

export interface TrackingIssue {
	number: number;
	body: string;
}

/** El runner de `gh`, inyectable para que un spec pueda observar la consulta sin lanzar un proceso. */
export type GhRunner = (...args: string[]) => string;

export function gh(...args: string[]): string {
	return execFileSync('gh', args, { encoding: 'utf8' });
}

/**
 * El filtro `in:title` de la búsqueda de GitHub matchea por palabras, no por igualdad: un título que
 * contenga al buscado como subcadena viene en la respuesta. Quedarse con el primero adoptaría un issue
 * ajeno y le escribiría encima, así que la igualdad se exige acá.
 */
export function selectTrackingIssue<T extends { title: string }>(issues: T[], title: string): T | null {
	return issues.find((issue) => issue.title === title) ?? null;
}

export function findTrackingIssue(title: string, run: GhRunner = gh): TrackingIssue | null {
	const raw = run('issue', 'list', '--state', 'open', '--search', `"${title}" in:title`, '--json', 'number,title,body');
	const found = selectTrackingIssue(JSON.parse(raw) as { number: number; title: string; body: string }[], title);
	// Un issue sin cuerpo llega como `null`, y quien lo recibe compara contra la huella que el cuerpo
	// lleva embebida: normalizarlo acá evita que cada consumidor repita el mismo `?? ''`.
	return found ? { number: found.number, body: found.body ?? '' } : null;
}
