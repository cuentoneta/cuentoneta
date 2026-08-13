import { createIfNotExists, defineMigration } from 'sanity/migrate';

import { buildCollectionDocument, type StorylistDocument } from './build-collection-document';

/**
 * Crea una colección publicada por cada storylist publicada, con su descripción convertida desde
 * Portable Text y sus obras reapuntadas a las que dejó la migración de cuentos.
 *
 * **No toca la storylist de origen:** itera un tipo y emite la mutación sobre otro documento. Por eso
 * la reversión es un borrado limpio, y la página vieja sigue sirviéndose durante toda la convivencia.
 *
 * **La idempotencia viene de `createIfNotExists` sobre un identificador derivado.** Se descarta
 * `createOrReplace`, que refrescaría el contenido en cada corrida pisando las correcciones editoriales
 * hechas en el Studio después de migrar. El contador de la CLI cuenta mutaciones **emitidas**, no
 * aplicadas: una segunda corrida vuelve a reportar el total, y la idempotencia se comprueba en el
 * contenido, no en ese número.
 *
 * **Aborta ante lo que no puede traducir**, y esa postura es específica de este ámbito: una storylist
 * publicada sin descripción o sin slug es un error del dataset, no un estado legítimo, y saltearla en
 * silencio dejaría el corpus a medio migrar sin que nada lo señale. La migración de borradores toma la
 * decisión opuesta, por la razón opuesta.
 *
 * **Prerequisito:** la migración de cuentos a obras tiene que estar aplicada en el mismo dataset. El
 * reapuntado deriva el identificador de cada obra; si la obra no existe y la referencia es fuerte, el
 * content lake rechaza la transacción al escribir. El dry-run no lo detecta: imprime mutaciones sin
 * llegar al servidor.
 */
export default defineMigration({
	title: 'Crear una colección por cada storylist publicada',
	documentTypes: ['storylist'],
	filter: "!(_id in path('drafts.**'))",
	migrate: {
		document(doc: StorylistDocument) {
			return [createIfNotExists(buildCollectionDocument(doc))];
		},
	},
});
