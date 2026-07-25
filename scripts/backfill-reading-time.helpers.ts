/**
 * Helpers puros del backfill de reading time (sin I/O): dado el shape crudo de una obra (proyección
 * GROQ), decide qué falta y arma el plan de patch idempotente. Separados del orquestador
 * `backfill-reading-time.ts` (red/Sanity) para poder testear la decisión sin tocar la red.
 */
import { createMarkdown } from '../src/app/models/markdown.model';
import {
	deriveSectionReadingTime,
	deriveTotalReadingTime,
	type ReadingTime,
} from '../src/app/models/reading-time.model';

// Shape crudo mínimo (proyección GROQ) de una obra candidata. El script no importa los tipos
// generados de `cms/`: proyecta solo lo necesario para computar el plan.
export interface RawWorkForBackfill {
	readonly _id: string;
	readonly totalReadingTime?: number | null;
	readonly content: readonly RawSectionForBackfill[];
}

export interface RawSectionForBackfill {
	readonly _key: string;
	readonly body: string;
	readonly readingTime?: number | null;
}

// El readingTime de una sección que lo tenía ausente, identificada por su `_key` (no por índice del
// array: el patch selecciona por `_key` para ser estable ante reordenamientos).
export interface SectionReadingTimePatch {
	readonly key: string;
	readonly readingTime: ReadingTime;
}

// Plan de patch idempotente de una obra: solo lo que falta. Vacío ⇒ nada que hacer.
export interface BackfillPlan {
	readonly sectionReadingTimes: readonly SectionReadingTimePatch[];
	readonly totalReadingTime?: ReadingTime;
}

export function planBackfill(work: RawWorkForBackfill): BackfillPlan {
	const sectionReadingTimes = work.content
		.filter((section) => isMissing(section.readingTime))
		.map((section) => ({ key: section._key, readingTime: deriveSectionReadingTime(createMarkdown(section.body)) }));

	// El total persistido es la suma pura del texto: `readingTimeOverride` no interviene — ni se
	// proyecta ni se toca; su precedencia vive en la factory de dominio.
	const totalReadingTime = isMissing(work.totalReadingTime)
		? deriveTotalReadingTime(work.content.map((section) => createMarkdown(section.body)))
		: undefined;

	return { sectionReadingTimes, totalReadingTime };
}

export function isEmptyPlan(plan: BackfillPlan): boolean {
	return plan.sectionReadingTimes.length === 0 && plan.totalReadingTime === undefined;
}

// "Falta" = ausente (null/undefined), la misma semántica que `setIfMissing` en el patch: un valor
// ya presente no se recomputa ni se pisa.
function isMissing(value: number | null | undefined): boolean {
	return value === null || value === undefined;
}
