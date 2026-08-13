import { createIfNotExists, defineMigration } from 'sanity/migrate';

import { buildLiteraryWorkDocument, type StoryDocument } from '../story-to-literary-work/build-literary-work-document';

/**
 * Crea una obra **en borrador** por cada cuento en borrador, con su contenido convertido desde
 * Portable Text.
 *
 * **Nada se publica.** El identificador derivado conserva el prefijo de path del origen, así que un
 * cuento inédito produce una obra inédita, y las queries del sitio excluyen borradores: nada de esto
 * llega a una página.
 *
 * Que la obra pueda referenciar a un autor todavía inédito no viene de estar en borrador —el content
 * lake rechaza una referencia fuerte a un documento inexistente sin importar eso— sino de que el
 * armado conserva la marca de referencia **débil** que el Studio ya puso en el cuento de origen.
 *
 * **Un cuento con versión publicada y borrador produce el borrador de su misma obra**, porque ambos
 * identificadores derivan del mismo uuid. No nace una obra distinta ni se toca la publicada.
 *
 * **Los borradores incompletos se excluyen en el filtro, no en el código.** Un borrador a medio
 * escribir es un estado legítimo, no un error del dataset, así que no corresponde ni abortar la
 * corrida entera ni saltearlo desde el mapeo: la exclusión declarativa queda a la vista en el diff y
 * el censo dice exactamente qué quedó afuera. El armado del documento sigue lanzando ante un dato que
 * no permite construir una obra válida, ahora como defensa en profundidad.
 *
 * Esas mismas condiciones están escritas en `scripts/audit/audit-story-portable-text.ts`, que reporta
 * cuántos cuentos admiten y cuántos excluyen. Viven duplicadas porque el Studio es un proyecto pnpm
 * aparte: **al tocar una hay que tocar la otra**, o el contraste del dry-run contra el censo valida en
 * verde sin verificar nada.
 */
export default defineMigration({
	title: 'Crear una obra en borrador por cada cuento en borrador',
	documentTypes: ['story'],
	filter:
		"_id in path('drafts.**') && defined(title) && defined(slug.current) && defined(author._ref) && count(body) > 0",
	migrate: {
		document(doc: StoryDocument) {
			return [createIfNotExists(buildLiteraryWorkDocument(doc))];
		},
	},
});
