import { at, defineMigration, set } from 'sanity/migrate';

import { applySectionCorrections, CORRECTION_STATUSES, UncorrectableLiteraryWorkError } from './apply-corrections';
import { CORRECTIONS_BY_DOCUMENT_ID, TARGET_DOCUMENT_IDS, type Correction } from './corrections';

const DRAFTS_PATH_PREFIX = 'drafts.';

// El shape mínimo que la migración lee. No se importan los tipos del typegen: describen el schema, y
// lo que la migración recibe es el documento crudo tal como Sanity lo devuelve.
interface LiteraryWorkDocument {
	_id: string;
	// `body` va como `unknown` a propósito: el documento llega crudo del content lake, no tipado por el
	// typegen, y que su forma sea la esperada es justamente lo que la migración comprueba.
	content?: { _key?: string; body?: unknown }[];
}

function publishedIdOf(id: string): string {
	return id.startsWith(DRAFTS_PATH_PREFIX) ? id.slice(DRAFTS_PATH_PREFIX.length) : id;
}

/**
 * Comprueba, con el documento entero a la vista, que ninguna corrección haya quedado sin encontrar.
 * El motor no puede concluirlo: ve una sección por vez, y ausente en una puede ser presente en otra.
 */
function assertEveryCorrectionResolved(
	corrections: readonly Correction[],
	resolved: ReadonlySet<string>,
	documentId: string,
): void {
	const missing = corrections.find((correction) => !resolved.has(correction.id));
	if (missing) {
		throw new UncorrectableLiteraryWorkError(
			`El documento "${documentId}" no contiene el pasaje a corregir en ninguna de sus secciones`,
			missing.id,
		);
	}
}

/**
 * Reexpresa en Markdown semántico los pasajes de tres obras donde el Portable Text original usaba
 * alineación centrada para cargar significado: dos avisos impresos que pasan a ser cita, una firma
 * que pasa a énfasis y un encabezado de parte que había quedado pegado al texto que lo sigue.
 *
 * **Orden de despliegue: independiente del código.** No cambia el nombre ni la forma de ningún campo
 * —el cuerpo sigue siendo Markdown antes y después— y el pipeline ya renderiza cita, énfasis y
 * párrafos. Puede correr en cualquier momento respecto de un despliegue.
 *
 * **Las reglas que enmarcan los avisos no son separadores de escena.** En el original eran filas de
 * asteriscos centradas, o sea el borde del papel impreso, y por eso la cita las reemplaza en vez de
 * sumarse a ellas. Los separadores de escena reales del mismo cuerpo son la misma construcción y no
 * se tocan: el motor solo consume las dos reglas contiguas al ancla.
 *
 * **Aborta ante un cuerpo que ya no coincide con el relevamiento**, en vez de pasar de largo. Una
 * edición hecha en el Studio entre el relevamiento y la corrida es exactamente lo que hay que ver.
 *
 * **Idempotente y observable:** emite patches, no creaciones, así que una segunda corrida no emite
 * ninguna mutación y el contador de la CLI sirve como señal.
 */
export default defineMigration({
	title: 'Reexpresar en Markdown semántico los pasajes que el original centraba',
	documentTypes: ['literaryWork'],
	filter: `_id in [${TARGET_DOCUMENT_IDS.flatMap((id) => [`"${id}"`, `"${DRAFTS_PATH_PREFIX}${id}"`]).join(', ')}]`,
	migrate: {
		document(doc: LiteraryWorkDocument) {
			// El guard vive acá y no solo en el filtro: el filtro acota el recorrido, no garantiza el alcance.
			const corrections = CORRECTIONS_BY_DOCUMENT_ID[publishedIdOf(doc._id)];
			if (!corrections) {
				return [];
			}

			const resolved = new Set<string>();
			const patches = (doc.content ?? []).flatMap((section) => {
				if (!section._key) {
					throw new UncorrectableLiteraryWorkError(
						`Una sección de "${doc._id}" no tiene _key, así que el patch no puede anclarse`,
					);
				}
				// Un cuerpo con otra forma no se saltea: el síntoma llegaría como "el documento no
				// contiene el pasaje", que apunta al lugar equivocado. Ausente sí es legítimo.
				if (section.body !== undefined && typeof section.body !== 'string') {
					throw new UncorrectableLiteraryWorkError(
						`La sección "${section._key}" de "${doc._id}" tiene un cuerpo que no es texto`,
					);
				}
				const body = section.body ?? '';
				const { body: corrected, statuses } = applySectionCorrections(body, corrections);

				Object.entries(statuses)
					.filter(([, status]) => status !== CORRECTION_STATUSES.absent)
					.forEach(([id]) => resolved.add(id));

				return corrected === body ? [] : [at(`content[_key=="${section._key}"].body`, set(corrected))];
			});

			assertEveryCorrectionResolved(corrections, resolved, doc._id);
			return patches;
		},
	},
});
