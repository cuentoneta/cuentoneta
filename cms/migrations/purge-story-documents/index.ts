import { defineMigration, del } from 'sanity/migrate';

const DOCUMENT_TYPE = 'story';

interface StoryDocument {
	_id: string;
	_type: string;
}

/**
 * Purga los cuentos, cuyo contenido ya se migró a las obras literarias en Markdown.
 *
 * **Es la última del orden**, y con ella el dataset queda con un solo modelo de contenido en vez de
 * dos donde uno está apagado. Corre recién cuando ya no queda ningún referente: la baja de los campos
 * de referencia se lleva los de la página de inicio y del contenido rotativo, y la purga de las listas
 * los de `stories`.
 *
 * Sin `filter`: el recorrido tiene que alcanzar también los borradores. `del` borra la versión que
 * recibe, así que la publicada y su borrador se dan de baja cada una por su cuenta.
 *
 * **No tiene migración hermana de reversión y no puede tenerla**: no crea nada que una de vuelta pueda
 * reconocer, y lo que borra no se reconstruye. El plan de recuperación es el export previo al que
 * apunta el runbook, que además queda como la única copia del cuento publicado sin obra derivada.
 */
export default defineMigration({
	title: 'Purgar del dataset los cuentos retirados',
	documentTypes: [DOCUMENT_TYPE],
	migrate: {
		document(doc: StoryDocument) {
			// El guard es la garantía y `documentTypes` la optimización: una invocación con otro alcance
			// —o un cambio futuro en el runner— no debe alcanzar para borrar otra cosa.
			if (doc._type !== DOCUMENT_TYPE) {
				return [];
			}
			return [del(doc._id)];
		},
	},
});
