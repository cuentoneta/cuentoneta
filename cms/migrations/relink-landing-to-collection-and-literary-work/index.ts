import { at, defineMigration, setIfMissing } from 'sanity/migrate';

import {
	buildCollectionReferences,
	buildLiteraryWorkReferences,
	type KeyedReference,
} from './build-relinked-references';

// El shape mínimo que la migración lee, con los campos de los dos tipos en un solo lugar. No se importan
// los tipos del typegen: declaran todos los campos como opcionales, así que no aportan sobre esto y atan
// la migración al schema vigente.
//
// `_type` va como `string` y no como unión de literales: el runner tipa el documento como `SanityDocument`,
// donde es `string`, y acotarlo acá vuelve la función incompatible con la firma que espera.
interface RelinkableDocument {
	_id: string;
	_type: string;
	cards?: KeyedReference[];
	latestReads?: KeyedReference[];
	mostRead?: KeyedReference[];
}

/**
 * Puebla los campos que referencian colecciones y obras a partir de los que referencian storylists e
 * historias, sin tocar estos últimos.
 *
 * **Orden de despliegue:** corre después de desplegar el Studio con los campos nuevos y **antes** de que
 * la aplicación los lea. Es segura en esa ventana porque no modifica nada que alguien esté leyendo: los
 * campos nuevos nacen vacíos y nadie los consulta hasta el despliegue que cambia el contrato.
 *
 * **Backfill, no sincronización.** Usa `setIfMissing` en lugar de `set` para que una corrida tardía —con
 * el contrato nuevo ya desplegado y algún campo editado a mano en el Studio— no pise esa edición con lo
 * derivado del campo viejo. Es lo que la vuelve idempotente y re-corrible, que hace falta porque el
 * generador de semanas futuras copia hacia adelante sólo los campos viejos hasta ese despliegue.
 *
 * Un documento cuya fuente está vacía no produce mutación: escribir una lista vacía lo marcaría como
 * migrado sin haberlo estado.
 */
export default defineMigration({
	title: 'Reapuntar las referencias de la página de inicio y del contenido rotativo al dominio nuevo',
	documentTypes: ['landingPage', 'rotatingContent'],
	// Sin filtro: los borradores también se migran. Sólo se sirve el documento publicado, así que migrarlos
	// no aporta a lo que se lee, pero omitirlos sí quita: publicar un borrador reemplaza al publicado por el
	// contenido del borrador, y uno creado antes de la corrida no trae los campos nuevos. Dejarlos afuera
	// convierte cada publicación pendiente en una pérdida silenciosa de lo migrado.
	migrate: {
		document(doc: RelinkableDocument) {
			// Los dos tipos se nombran explícitamente en vez de tratar a `landingPage` como el caso por
			// defecto: si mañana se suma un tipo a la lista de arriba, el default le escribiría campos que no
			// tiene en vez de ignorarlo.
			if (doc._type === 'rotatingContent') {
				const mostReadLiteraryWorks = buildLiteraryWorkReferences(doc.mostRead);
				return mostReadLiteraryWorks.length > 0
					? [at('mostReadLiteraryWorks', setIfMissing(mostReadLiteraryWorks))]
					: [];
			}

			if (doc._type !== 'landingPage') {
				return [];
			}

			const collections = buildCollectionReferences(doc.cards);
			const latestLiteraryWorks = buildLiteraryWorkReferences(doc.latestReads);

			return [
				...(collections.length > 0 ? [at('collections', setIfMissing(collections))] : []),
				...(latestLiteraryWorks.length > 0 ? [at('latestLiteraryWorks', setIfMissing(latestLiteraryWorks))] : []),
			];
		},
	},
});
