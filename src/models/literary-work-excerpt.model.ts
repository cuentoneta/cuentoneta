import type { SectionTitle } from './section-title.model';
import type { SanitizedHtml } from './sanitized-html.model';

/**
 * Largo visible máximo del cuerpo de un extracto: caracteres de texto en unidades UTF-16, sin contar el
 * `…` que marca el recorte. Un salto de línea cuenta como un carácter.
 */
export const LITERARY_WORK_EXCERPT_MAX_LENGTH = 200;

/**
 * Lo que una tarjeta de listado muestra de una obra: el arranque de su sección de apertura, ya
 * saneado, con un cuerpo que no supera `LITERARY_WORK_EXCERPT_MAX_LENGTH`. El tope lo garantiza
 * `markdownToExcerptHtml`, la única función que produce ese cuerpo; la factory no lo verifica.
 *
 * Es más angosto que `LiteraryWorkSection` a propósito. No transporta `readingTime` ni `position`
 * porque su cuerpo viene **recortado**: derivar un tiempo de lectura de un extracto daría un número
 * que no es el de ninguna sección, y una posición sugeriría que el extracto es una de ellas. Que el
 * tipo no exponga esos campos es lo que vuelve imposible engancharlos por error.
 */
export interface LiteraryWorkExcerpt {
	readonly title?: SectionTitle;
	readonly bodyHtml: SanitizedHtml;
}

interface CreateLiteraryWorkExcerptOptions {
	title?: SectionTitle;
	bodyHtml: SanitizedHtml;
}

export function createLiteraryWorkExcerpt(options: CreateLiteraryWorkExcerptOptions): LiteraryWorkExcerpt {
	return Object.freeze({ ...options });
}
