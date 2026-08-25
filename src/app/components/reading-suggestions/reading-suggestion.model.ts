import type { LiteraryWorkTeaser } from '@models/literary-work.model';
import type { TextBlockContent } from '@models/block-content.model';

/**
 * TODO(#2037): view model temporal — se elimina cuando la tríada consuma `LiteraryWorkTeaser[]` puro.
 *
 * El envoltorio existe porque la tarjeta todavía acepta el extracto como párrafos sueltos de Portable
 * Text, herencia de cuando la fuente era el dominio viejo. Con la fuente nativa los párrafos van
 * siempre vacíos y la tarjeta pinta el extracto que el teaser trae adentro.
 */
export interface ReadingSuggestion {
	readonly literaryWork: LiteraryWorkTeaser;
	readonly excerptParagraphs: TextBlockContent[];
}

export function toReadingSuggestion(literaryWork: LiteraryWorkTeaser): ReadingSuggestion {
	return { literaryWork, excerptParagraphs: [] };
}
