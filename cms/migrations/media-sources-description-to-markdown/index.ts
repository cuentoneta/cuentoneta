import { at, defineMigration, set } from 'sanity/migrate';
import {
	portableTextToMarkdown,
	type PortableTextBlock,
} from '../../../resources/portable-text-to-markdown/portable-text-to-markdown';

// El shape mínimo que la migración necesita del documento. No se importan los tipos generados del
// typegen porque describen el schema **nuevo** (donde la descripción ya es un string), y lo que esta
// migración lee es el viejo.
interface MediaSourceDocument {
	_id: string;
	mediaSources?: { _key: string; _type: string; description?: unknown }[];
}

// Idempotencia: una descripción ya migrada es un string. Correr la migración dos veces no la vuelve a
// tocar, que es lo que permite reintentarla si se cortó a mitad de camino.
function needsMigration(description: unknown): description is PortableTextBlock[] {
	return Array.isArray(description);
}

/**
 * Lleva la descripción de cada recurso multimedia de Portable Text a Markdown, en los tres tipos de
 * documento que embeben `mediaSources`.
 *
 * El relevamiento previo (142 documentos, una descripción cada uno) no encontró ninguna construcción
 * fuera de párrafo con énfasis, negrita y enlaces. Aun así el conversor **lanza** ante cualquier otra:
 * si aparece una, la corrida se detiene identificando el documento en vez de perder contenido en
 * silencio.
 *
 * **Orden de despliegue:** esta migración corre **después** de desplegar el código que lee la
 * descripción como Markdown. Al revés rompería el sitio: el código viejo espera un array y recibiría un
 * string. Mientras tanto, un documento sin migrar solo pierde su widget — el ACL lo descarta con rastro.
 */
export default defineMigration({
	title: 'Migrar la descripción de los recursos multimedia de Portable Text a Markdown',
	documentTypes: ['story', 'storylist', 'literaryWork'],
	migrate: {
		document(doc: MediaSourceDocument) {
			return (doc.mediaSources ?? [])
				.filter((mediaSource) => needsMigration(mediaSource.description))
				.map((mediaSource) => {
					const markdown = portableTextToMarkdown(mediaSource.description as PortableTextBlock[]);
					if (markdown.trim() === '') {
						throw new Error(
							`La descripción de "${mediaSource._key}" (${mediaSource._type}) en ${doc._id} quedaría vacía: ` +
								`el campo es requerido y una cadena vacía haría fallar el mapeo de la obra entera.`,
						);
					}
					// El path se ancla por `_key` y no por índice: un índice se corre si alguien reordena los
					// recursos entre el dry-run y la corrida real.
					return at(`mediaSources[_key=="${mediaSource._key}"].description`, set(markdown));
				});
		},
	},
});
