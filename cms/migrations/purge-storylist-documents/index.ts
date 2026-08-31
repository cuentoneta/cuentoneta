import { defineMigration, del } from 'sanity/migrate';

const DOCUMENT_TYPE = 'storylist';

interface StorylistDocument {
	_id: string;
	_type: string;
}

/**
 * Purga las listas de contenido, cuyo contenido ya se traspasó a las colecciones.
 *
 * Segunda de las tres corridas del runbook (`../purge-story-documents/README.md`), que es donde vive
 * el orden y por eso este archivo no lo repite: cada lista referencia sus cuentos, así que borrarla es
 * lo que los deja sin referentes.
 *
 * Sin `filter`: el recorrido tiene que alcanzar también los borradores. `del` borra la versión que
 * recibe, así que la publicada y su borrador se dan de baja cada una por su cuenta.
 */
export default defineMigration({
	title: 'Purgar del dataset las listas de contenido retiradas',
	documentTypes: [DOCUMENT_TYPE],
	migrate: {
		document(doc: StorylistDocument) {
			if (doc._type !== DOCUMENT_TYPE) {
				return [];
			}
			return [del(doc._id)];
		},
	},
});
