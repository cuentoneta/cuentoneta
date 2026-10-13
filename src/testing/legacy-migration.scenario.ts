import { onoffCollectionDocumentsMock, onoffLiteraryWorkDocumentsMock } from '@mocks/onoff-documents.mock';
import { MIGRATED_ID_PREFIX } from '@api/modules/legacy-route/legacy-route.constants';

type LegacyKind = keyof typeof MIGRATED_ID_PREFIX;

/** Un documento de origen y el documento migrado que la migración emitió a partir de él. */
export interface LegacyMigrationPair {
	readonly kind: LegacyKind;
	readonly origin: { readonly _id: string; readonly _type: LegacyKind; readonly slug: { current: string } };
	readonly migrated: { readonly _id: string; readonly _type: string; readonly slug: { current: string } };
}

function migration(
	kind: LegacyKind,
	canon: { _id: string },
	legacySlug: string,
	migratedSlug: string,
): LegacyMigrationPair {
	const migratedType = { story: 'literaryWork', storylist: 'collection' }[kind];
	const origin = {
		...canon,
		_id: `onoff-${kind}-${legacySlug.toLowerCase()}`,
		_type: kind,
		slug: { _type: 'slug', current: legacySlug },
	};
	const migrated = {
		...canon,
		_id: `${MIGRATED_ID_PREFIX[kind]}${origin._id}`,
		_type: migratedType,
		slug: { _type: 'slug', current: migratedSlug },
	};
	return { kind, origin, migrated };
}

const [firstLiteraryWork, secondLiteraryWork, thirdLiteraryWork] = onoffLiteraryWorkDocumentsMock;
const [canonCollection] = onoffCollectionDocumentsMock;

/**
 * Migraciones que reproducen los casos en que el slug del migrado no es el de su origen, derivadas del
 * canon. Sus `_id` y slugs no chocan con los de `onoffDatasetMock`, así que se suman a él.
 *
 * - Cadena de renombres: el slug viejo de una obra es el slug vigente de otra, así que resolver por slug
 *   tal cual lleva a la obra equivocada.
 * - Un slug viejo con mayúsculas, que el dominio vigente ya no construye.
 * - Una colección cuyo slug cambió.
 */
export const legacyMigrationPairs: readonly LegacyMigrationPair[] = [
	migration('story', firstLiteraryWork, 'onoff-renombre-original', 'onoff-renombre-intermedio'),
	migration('story', secondLiteraryWork, 'onoff-renombre-intermedio', 'onoff-renombre-final'),
	migration('story', thirdLiteraryWork, 'OnoffMayusculas', 'onoff-minusculas'),
	migration('storylist', canonCollection, 'onoff-coleccion-original', 'onoff-coleccion-renombrada'),
];

export const legacyMigrationDocuments = legacyMigrationPairs.flatMap(({ origin, migrated }) => [origin, migrated]);
