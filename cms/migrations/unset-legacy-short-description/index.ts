import { at, defineMigration, unset } from 'sanity/migrate';

// El shape mínimo que la migración necesita del documento. No se importan los tipos del typegen porque
// ya no declaran `shortDescription`, que es justamente lo que esta migración busca.
interface RenamedDocument {
	_id: string;
	shortDescription?: unknown;
	description?: unknown;
}

/**
 * Da de baja `shortDescription` en los tipos que ya renombraron el campo.
 *
 * **Orden de despliegue:** corre **después** de que el código que lee `description` esté verificado en
 * producción, y después de que `copy-short-description-to-description` haya poblado el nombre nuevo.
 * Adelantarla deja al código todavía desplegado leyendo un campo ausente.
 *
 * **Es destructiva** y el dato solo se recupera del historial de Sanity, así que en vez de confiar en el
 * orden de las corridas lo verifica documento a documento: si la descripción no está bajo el nombre
 * nuevo, lanza en lugar de borrar la única copia que queda.
 *
 * Es idempotente: un documento sin `shortDescription` no produce mutación.
 */
export default defineMigration({
	title: 'Dar de baja el shortDescription heredado de resourceType y tag',
	documentTypes: ['resourceType', 'tag'],
	migrate: {
		document(doc: RenamedDocument) {
			if (!('shortDescription' in doc)) return [];

			if (typeof doc.description !== 'string' || doc.description.trim() === '') {
				throw new Error(
					`${doc._id} todavía no tiene su descripción bajo el nombre nuevo: correr primero ` +
						`copy-short-description-to-description, porque dar de baja el campo viejo acá borraría la única copia.`,
				);
			}

			return [at('shortDescription', unset())];
		},
	},
});
