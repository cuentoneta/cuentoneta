import { type Author } from '@models/author.model';
import { type LiteraryWork } from '@models/literary-work.model';
import { htmlToPlainText } from '@utils/html-to-text.utils';
import { excerptAtWordBoundary } from '@utils/text-excerpt.utils';

// Google trunca el snippet por ancho en píxeles, no por caracteres; este largo suele verse completo, y
// cortar en una palabra evita que el truncado lo haga a mitad de una.
const META_DESCRIPTION_MAX_LENGTH = 155;

/** Comienzo de la biografía en texto plano; la plantilla del perfil si la biografía no tiene texto. */
export function buildAuthorMetaDescription(author: Author): string {
	const plainText = htmlToPlainText(author.biography);
	if (!plainText) {
		return `Perfil y obras de ${author.name} para leer en La Cuentoneta.`;
	}
	return excerptAtWordBoundary(plainText, META_DESCRIPTION_MAX_LENGTH);
}

/**
 * Comienzo del cuerpo de la primera sección con texto, sin epígrafes ni nota editorial: son paratexto y
 * no dicen de qué trata la obra. Si ninguna sección transportada tiene texto, la descripción genérica.
 */
export function buildLiteraryWorkMetaDescription(literaryWork: LiteraryWork): string {
	for (const section of literaryWork.content) {
		const plainText = htmlToPlainText(section.bodyHtml);
		if (plainText) {
			return excerptAtWordBoundary(plainText, META_DESCRIPTION_MAX_LENGTH);
		}
	}
	return 'Una lectura en La Cuentoneta: Una iniciativa que busca fomentar y hacer accesible la lectura digital.';
}
