import { at, defineMigration, set } from 'sanity/migrate';
import {
	portableTextToMarkdown,
	type PortableTextBlock,
} from '../../../resources/portable-text-to-markdown/portable-text-to-markdown';

// El shape mínimo que la migración necesita del documento. No se importan los tipos generados del
// typegen porque describen el schema **nuevo** (donde la biografía ya es un string), y lo que esta
// migración lee es el viejo.
interface AuthorDocument {
	_id: string;
	biography?: unknown;
}

// Idempotencia: una biografía ya migrada es un string. Correr la migración dos veces no la vuelve a
// tocar, que es lo que permite reintentarla si se cortó a mitad de camino.
function needsMigration(biography: unknown): biography is PortableTextBlock[] {
	return Array.isArray(biography);
}

/**
 * Lleva la biografía del autor de Portable Text a Markdown.
 *
 * El conversor **lanza** ante cualquier construcción que no sepa traducir: si aparece una, la corrida
 * se detiene identificando el documento en vez de perder contenido en silencio.
 *
 * **Orden de despliegue:** esta migración corre **después** de desplegar el código que lee la biografía
 * como Markdown, y ninguna de las dos formas del dato tolera el código de la otra. El alcance del corte
 * excede a la ficha de autor: el mismo mapper resuelve el autor embebido en la página de una obra, así
 * que un dataset sin migrar deja ambas rutas sirviendo un error mientras dure la ventana.
 */
export default defineMigration({
	title: 'Migrar la biografía de autor de Portable Text a Markdown',
	documentTypes: ['author'],
	migrate: {
		document(doc: AuthorDocument) {
			if (!needsMigration(doc.biography)) {
				return [];
			}

			const markdown = portableTextToMarkdown(doc.biography);
			if (markdown.trim() === '') {
				throw new Error(
					`La biografía de ${doc._id} quedaría sin texto: el campo es requerido y un valor en blanco haría ` +
						`fallar el mapeo del autor en cada lectura de su ficha publicada.`,
				);
			}

			return [at('biography', set(markdown))];
		},
	},
});
