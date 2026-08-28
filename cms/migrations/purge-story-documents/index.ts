import { defineMigration, del } from 'sanity/migrate';

const DOCUMENT_TYPE = 'story';

interface StoryDocument {
	_id: string;
	_type: string;
}

/**
 * Purga los cuentos, cuyo contenido ya se migró a las obras literarias en Markdown.
 *
 * Última de las tres corridas del runbook (`./README.md`), que es donde vive el orden y por eso este
 * archivo no lo repite. Con ella el dataset queda con un solo modelo de contenido en vez de dos donde
 * uno está apagado.
 *
 * Sin `filter`: el recorrido tiene que alcanzar también los borradores. `del` borra la versión que
 * recibe, así que la publicada y su borrador se dan de baja cada una por su cuenta.
 *
 * El export previo del runbook es además la única copia que queda del cuento sin obra derivada.
 */
export default defineMigration({
	title: 'Purgar del dataset los cuentos retirados',
	documentTypes: [DOCUMENT_TYPE],
	migrate: {
		document(doc: StoryDocument) {
			if (doc._type !== DOCUMENT_TYPE) {
				return [];
			}
			return [del(doc._id)];
		},
	},
});
