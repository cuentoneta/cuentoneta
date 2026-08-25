import { at, defineMigration, unset } from 'sanity/migrate';

import {
	buildCollectionReferences,
	buildLiteraryWorkReferences,
	type KeyedReference,
} from '../relink-landing-to-collection-and-literary-work/build-relinked-references';

// Mismo shape mínimo que la migración de ida, más los campos nuevos, que son los que esta reversión mira.
// `_type` va como `string` por el mismo motivo que allá: el runner lo tipa así y acotarlo vuelve la
// función incompatible con la firma que espera.
interface RelinkedDocument {
	_id: string;
	_type: string;
	cards?: KeyedReference[];
	latestReads?: KeyedReference[];
	mostRead?: KeyedReference[];
	collections?: KeyedReference[];
	latestLiteraryWorks?: KeyedReference[];
	mostReadLiteraryWorks?: KeyedReference[];
}

/**
 * Da de baja un campo sólo si su contenido es exactamente lo que la migración de ida habría escrito.
 *
 * Dos cosas distintas lo impiden, y las dos terminan en un aborto en vez de en un borrado:
 *
 * - **La fuente ya no está.** El campo nuevo pasó a ser la única copia de esas referencias, así que
 *   borrarlo no revierte nada: destruye el dato.
 * - **El contenido no coincide con lo derivable.** Alguien lo editó a mano en el Studio. La ida cuida ese
 *   caso al escribir con semántica de backfill; la vuelta tiene que cuidarlo igual, o lo que una respeta
 *   la otra lo borra.
 *
 * La comparación reusa el módulo de derivación en vez de reimplementarlo: una segunda noción de "lo que
 * la ida habría escrito" divergiría, y la reversión pasaría a borrar lo que no escribió.
 */
function unsetIfMigrationWroteIt(
	field: string,
	source: KeyedReference[] | undefined,
	value: KeyedReference[] | undefined,
	derive: (references: readonly KeyedReference[] | undefined) => KeyedReference[],
) {
	if (!value) {
		return [];
	}
	if (!source || source.length === 0) {
		throw new Error(
			`No se puede dar de baja "${field}": su campo de origen ya no está poblado, así que borrarlo destruiría la única copia de esas referencias.`,
		);
	}
	if (JSON.stringify(value) !== JSON.stringify(derive(source))) {
		throw new Error(
			`No se puede dar de baja "${field}": su contenido no coincide con lo que la migración escribió, así que fue editado después. Borrarlo perdería esa edición.`,
		);
	}
	return [at(field, unset())];
}

/**
 * Deshace el reapuntado dando de baja los tres campos nuevos.
 *
 * Recorre los borradores igual que la ida, porque es lo que aquélla escribió.
 *
 * Es idempotente: un documento sin los campos nuevos no produce mutación.
 */
export default defineMigration({
	title: 'Revertir el reapuntado de referencias de la página de inicio y del contenido rotativo',
	documentTypes: ['landingPage', 'rotatingContent'],
	migrate: {
		document(doc: RelinkedDocument) {
			if (doc._type === 'rotatingContent') {
				return unsetIfMigrationWroteIt(
					'mostReadLiteraryWorks',
					doc.mostRead,
					doc.mostReadLiteraryWorks,
					buildLiteraryWorkReferences,
				);
			}

			if (doc._type !== 'landingPage') {
				return [];
			}

			return [
				...unsetIfMigrationWroteIt('collections', doc.cards, doc.collections, buildCollectionReferences),
				...unsetIfMigrationWroteIt(
					'latestLiteraryWorks',
					doc.latestReads,
					doc.latestLiteraryWorks,
					buildLiteraryWorkReferences,
				),
			];
		},
	},
});
