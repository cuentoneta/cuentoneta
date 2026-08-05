import { createIfNotExists, defineMigration } from 'sanity/migrate';

import { buildLiteraryWorkDocument, type StoryDocument } from '../story-to-literary-work/build-literary-work-document';

/**
 * Crea una obra **en borrador** por cada cuento en borrador, con su contenido convertido desde
 * Portable Text.
 *
 * **Nada se publica.** El identificador derivado conserva el prefijo de path del origen, así que un
 * cuento inédito produce una obra inédita. Eso es lo que vuelve lícito que la obra referencie a un
 * autor que también está en borrador: el content lake acepta esa referencia mientras el documento que
 * la contiene no se publique, y las queries del sitio excluyen borradores, así que nada de esto llega
 * a una página.
 *
 * **Un cuento con versión publicada y borrador produce el borrador de su misma obra**, porque ambos
 * identificadores derivan del mismo uuid. No nace una obra distinta ni se toca la publicada.
 *
 * **Los borradores incompletos se excluyen en el filtro, no en el código.** Un borrador a medio
 * escribir es un estado legítimo, no un error del dataset, así que no corresponde ni abortar la
 * corrida entera ni saltearlo desde el mapeo: la exclusión declarativa queda a la vista en el diff y
 * el censo dice exactamente qué quedó afuera. El armado del documento sigue lanzando ante un dato que
 * no permite construir una obra válida, ahora como defensa en profundidad.
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
