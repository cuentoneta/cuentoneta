import { createMarkdown } from '@models/markdown.model';
import { deriveSectionReadingTime, deriveTotalReadingTime, type ReadingTime } from '@models/reading-time.model';

// Shape crudo mínimo que necesita el planner: lo aportan tanto la query full como la de sección.
interface RawMaterializableSection {
	readonly _key: string;
	readonly body: string;
	readonly readingTime: number | null;
}

interface RawMaterializableWork {
	readonly totalReadingTime: number | null;
	readonly content: readonly RawMaterializableSection[];
}

export interface ReadingTimeMaterializationPlan {
	readonly sectionReadingTimes: ReadonlyArray<{ readonly key: string; readonly readingTime: ReadingTime }>;
	// Ausente cuando el total ya está persistido (o lo setea el editor): no hay nada que materializar.
	readonly totalReadingTime?: ReadingTime;
}

// `_key` de Sanity: alfanumérico, guion y guion bajo. Se valida antes de interpolarlo en la ruta del
// patch (`content[_key=="…"].readingTime`) para no inyectar en la expresión de selección del cliente.
const SANITY_KEY_PATTERN = /^[A-Za-z0-9_-]+$/;

export function sectionReadingTimePath(key: string): string {
	if (!SANITY_KEY_PATTERN.test(key)) {
		throw new Error(`_key de sección inválido para el patch de reading time: "${key}"`);
	}
	return `content[_key=="${key}"].readingTime`;
}

// Plan idempotente: solo enumera lo que falta persistir (secciones y/o total sin materializar).
// Es puro — la misma fuente de verdad (deriveSectionReadingTime/deriveTotalReadingTime) que el
// backfill batch; no toca el cliente ni decide si escribir (eso vive en el repository).
export function planReadingTimeMaterialization(raw: RawMaterializableWork): ReadingTimeMaterializationPlan {
	const sectionReadingTimes = raw.content
		.filter((section) => section.readingTime === null)
		.map((section) => ({ key: section._key, readingTime: deriveSectionReadingTime(createMarkdown(section.body)) }));
	if (raw.totalReadingTime !== null) {
		return { sectionReadingTimes };
	}
	return {
		sectionReadingTimes,
		totalReadingTime: deriveTotalReadingTime(raw.content.map((section) => createMarkdown(section.body))),
	};
}

export function isEmptyPlan(plan: ReadingTimeMaterializationPlan): boolean {
	return plan.sectionReadingTimes.length === 0 && plan.totalReadingTime === undefined;
}

// Traduce el plan al objeto de `setIfMissing`: paths de sección validados + el total cuando aplica.
// Puede lanzar ante un `_key` inválido (vía sectionReadingTimePath) — el repository lo trata como
// degradación (no escribe, sirve lo derivado).
export function buildPatchAttributes(plan: ReadingTimeMaterializationPlan): Record<string, number> {
	const attributes: Record<string, number> = {};
	if (plan.totalReadingTime !== undefined) {
		attributes['totalReadingTime'] = plan.totalReadingTime;
	}
	for (const { key, readingTime } of plan.sectionReadingTimes) {
		attributes[sectionReadingTimePath(key)] = readingTime;
	}
	return attributes;
}
