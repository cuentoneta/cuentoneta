import type { Markdown } from './markdown.model';
import { createReadingTime, deriveSectionReadingTime, sumReadingTimes, type ReadingTime } from './reading-time.model';

// Proyección estructural mínima de una sección para materializar su reading time: su `_key` (para
// direccionar el patch), el cuerpo Markdown (para computar) y el valor persistido actual (o `null`).
export interface ReadingTimeMaterializationSection {
	readonly _key: string;
	readonly body: Markdown;
	readonly readingTime: number | null;
}

export interface ReadingTimeMaterializationInput {
	readonly sections: readonly ReadingTimeMaterializationSection[];
	readonly totalReadingTime: number | null;
}

export interface ReadingTimeMaterialization {
	// Reading times resueltos (valor persistido presente ∪ valor computado): el read-path los sirve
	// sin recomputar `countWords`.
	readonly sectionReadingTimes: readonly ReadingTime[];
	readonly totalReadingTime: ReadingTime;
	// Patch de Sanity: solo los campos faltantes, direccionados como `setIfMissing`. Vacío si no falta nada.
	readonly setIfMissing: Readonly<Record<string, number>>;
	readonly isEmpty: boolean;
}

// Puerto angosto del cliente de escritura: la unidad no importa `@sanity/client`; el `SanityClient`
// real lo satisface estructuralmente (blindado con una aserción de tipo en el spec).
export interface ReadingTimeMaterializationWriter {
	patch(documentId: string): {
		setIfMissing(attributes: Record<string, number>): {
			commit(): Promise<unknown>;
		};
	};
}

// `_key` es identidad de sección generada por Sanity (alfanumérico). Se valida antes de interpolarlo:
// la expresión de selección la ejecuta el cliente Sanity, así que un `_key` corrupto (bug de migración,
// doc mal formado) sería inyección GROQ en la ruta de escritura. Ante un `_key` inseguro se lanza para
// que el consumidor degrade (no escribe) en vez de mandar un patch con un path envenenado.
const SANITY_KEY_PATTERN = /^[A-Za-z0-9_-]+$/;

function sectionReadingTimePath(key: string): string {
	if (!SANITY_KEY_PATTERN.test(key)) {
		throw new Error(`_key de sección inseguro para interpolar en el path del patch: "${key}"`);
	}
	return `content[_key=="${key}"].readingTime`;
}

function resolveTotalReadingTime(
	persistedTotal: number | null,
	sectionReadingTimes: readonly ReadingTime[],
	setIfMissing: Record<string, number>,
): ReadingTime {
	if (persistedTotal !== null) {
		// Un total presente es el valor editorial (p. ej. duración de un recitado): se sirve tal cual y
		// NUNCA se pisa ni se recalcula como suma del texto.
		return createReadingTime(persistedTotal);
	}
	// Suma de los reading times ya resueltos por sección (mismo contrato que `createLiteraryWork` y el
	// schema), no una re-derivación de los bodies: no re-parsea y el total queda consistente con los
	// `sectionReadingTimes` que la unidad sirve.
	const computed = sumReadingTimes(sectionReadingTimes);
	setIfMissing['totalReadingTime'] = computed;
	return computed;
}

// Compute-if-missing: por cada campo ausente computa el reading time con los helpers de dominio
// (fuente única del algoritmo) y lo agrega al patch `setIfMissing`; los presentes se sirven tal cual.
export function buildReadingTimeMaterialization(input: ReadingTimeMaterializationInput): ReadingTimeMaterialization {
	const setIfMissing: Record<string, number> = {};

	const sectionReadingTimes = input.sections.map((section) => {
		if (section.readingTime !== null) {
			return createReadingTime(section.readingTime);
		}
		const computed = deriveSectionReadingTime(section.body);
		setIfMissing[sectionReadingTimePath(section._key)] = computed;
		return computed;
	});

	const totalReadingTime = resolveTotalReadingTime(input.totalReadingTime, sectionReadingTimes, setIfMissing);

	return Object.freeze({
		sectionReadingTimes,
		totalReadingTime,
		setIfMissing: Object.freeze(setIfMissing),
		isEmpty: Object.keys(setIfMissing).length === 0,
	});
}

// Persiste el patch con `setIfMissing` (idempotente, write-once). Sin campos faltantes no hace
// round-trip de red.
export async function applyReadingTimeMaterialization(
	writer: ReadingTimeMaterializationWriter,
	documentId: string,
	materialization: ReadingTimeMaterialization,
): Promise<void> {
	if (materialization.isEmpty) {
		return;
	}
	await writer
		.patch(documentId)
		.setIfMissing({ ...materialization.setIfMissing })
		.commit();
}
