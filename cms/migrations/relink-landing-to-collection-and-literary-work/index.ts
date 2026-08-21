import { at, defineMigration, setIfMissing } from 'sanity/migrate';

import {
	buildCollectionReferences,
	buildLiteraryWorkReferences,
	type KeyedReference,
} from './build-relinked-references';

// El shape mínimo que la migración lee. No se importan los tipos del typegen: declaran los campos nuevos
// como opcionales y los viejos igual, así que no aportan sobre esto y atan la migración al schema vigente.
interface LandingPageDocument {
	_id: string;
	_type: 'landingPage';
	cards?: KeyedReference[];
	latestReads?: KeyedReference[];
}

interface RotatingContentDocument {
	_id: string;
	_type: 'rotatingContent';
	mostRead?: KeyedReference[];
}

type MigratedDocument = LandingPageDocument | RotatingContentDocument;

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
	// Los borradores quedan fuera: la landing publicada es la única que se sirve, y migrarlos sólo ensucia
	// el conteo con el que se verifica la corrida.
	filter: "!(_id in path('drafts.**'))",
	migrate: {
		document(doc: MigratedDocument) {
			if (doc._type === 'rotatingContent') {
				const mostReadLiteraryWorks = buildLiteraryWorkReferences(doc.mostRead);
				return mostReadLiteraryWorks.length > 0
					? [at('mostReadLiteraryWorks', setIfMissing(mostReadLiteraryWorks))]
					: [];
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
