import { yearOfHistoricalDate } from '../../src/utils/historical-date.utils';

export const YEAR_CLASSES = Object.freeze([
	'agrees',
	'diverges',
	'derived-only',
	'manual-only',
	'none',
	'invalid-date',
] as const);

export type YearClass = (typeof YEAR_CLASSES)[number];

/** Clases en las que el valor que sirve el API después del cambio difiere del que sirve hoy. */
const VALUE_CHANGING: readonly YearClass[] = ['diverges', 'derived-only'];

export interface AuthorYearRow {
	slug: string;
	bornOn: string | null;
	bornOnYear: number | null;
	diedOn: string | null;
	diedOnYear: number | null;
}

export interface YearEntry {
	slug: string;
	field: 'bornOnYear' | 'diedOnYear';
	date: string | null;
	persisted: number | null;
	derived: number | undefined;
	kind: YearClass;
}

/**
 * Compara el año persistido con el que el ACL deriva de la fecha (`yearOfHistoricalDate`, la misma
 * función), para saber si el valor que sirve el API cambia al dejar de leer el año persistido.
 */
export function classifyAuthorYear(date: string | null, persisted: number | null): YearClass {
	const derived = yearOfHistoricalDate(date);
	if (date && derived === undefined) return 'invalid-date';
	if (derived === undefined) return persisted === null ? 'none' : 'manual-only';
	if (persisted === null) return 'derived-only';
	return persisted === derived ? 'agrees' : 'diverges';
}

export function entriesOf(row: AuthorYearRow): YearEntry[] {
	const pairs = [
		{ field: 'bornOnYear', date: row.bornOn, persisted: row.bornOnYear },
		{ field: 'diedOnYear', date: row.diedOn, persisted: row.diedOnYear },
	] as const;
	return pairs.map(({ field, date, persisted }) => ({
		slug: row.slug,
		field,
		date,
		persisted,
		derived: yearOfHistoricalDate(date),
		kind: classifyAuthorYear(date, persisted),
	}));
}

export function changesServedValue(entry: YearEntry): boolean {
	return VALUE_CHANGING.includes(entry.kind);
}

export function countByClass(entries: readonly YearEntry[]): Record<YearClass, number> {
	const counts = Object.fromEntries(YEAR_CLASSES.map((kind) => [kind, 0])) as Record<YearClass, number>;
	for (const { kind } of entries) counts[kind] += 1;
	return counts;
}

export function formatCensusReport(entries: readonly YearEntry[]): string {
	const counts = countByClass(entries);
	const lines = YEAR_CLASSES.map((kind) => `  ${kind.padEnd(13)} ${counts[kind]}`);
	const changed = entries.filter(changesServedValue);
	const detail = changed.map(
		(e) =>
			`  ${e.kind.padEnd(12)} ${e.slug} ${e.field}: fecha ${e.date}, persistido ${e.persisted}, derivado ${e.derived}`,
	);
	const verdict = changed.length === 0 ? 'Ningún autor cambia de valor.' : 'Cambian de valor al desplegar:';
	return ['Clasificación por campo:', ...lines, '', verdict, ...detail].join('\n');
}
