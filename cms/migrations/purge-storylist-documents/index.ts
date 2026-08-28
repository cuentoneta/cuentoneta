import { defineMigration, del } from 'sanity/migrate';

const DOCUMENT_TYPE = 'storylist';

interface StorylistDocument {
	_id: string;
	_type: string;
}

/**
 * Purga las listas de contenido, cuyo contenido ya se traspasó a las colecciones.
 *
 * **Corre después de la baja de los campos de referencia y antes de la purga de los cuentos.** El
 * orden no es una preferencia: cada lista referencia sus cuentos con referencia fuerte, así que
 * borrarla primero es lo que deja a los cuentos sin referentes. Va en su propia migración y no junto
 * con la de cuentos porque el runner batchea mutaciones y no garantiza el orden dentro de una corrida:
 * un `documentTypes` con los dos tipos podría intentar borrar un cuento todavía referenciado y
 * detenerse a mitad de camino, con documentos ya borrados.
 *
 * Sin `filter`: el recorrido tiene que alcanzar también los borradores. `del` borra la versión que
 * recibe, así que la publicada y su borrador se dan de baja cada una por su cuenta.
 *
 * **No tiene migración hermana de reversión y no puede tenerla**: no crea nada que una de vuelta
 * pueda reconocer, y lo que borra no se reconstruye. El plan de recuperación es el export previo al
 * que apunta el runbook.
 */
export default defineMigration({
	title: 'Purgar del dataset las listas de contenido retiradas',
	documentTypes: [DOCUMENT_TYPE],
	migrate: {
		document(doc: StorylistDocument) {
			// El guard es la garantía y `documentTypes` la optimización: una invocación con otro alcance
			// —o un cambio futuro en el runner— no debe alcanzar para borrar otra cosa.
			if (doc._type !== DOCUMENT_TYPE) {
				return [];
			}
			return [del(doc._id)];
		},
	},
});
