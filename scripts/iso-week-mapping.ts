// Funciones puras del mapeo de semanas locale → ISO-8601 para la migración #1751.
// Separadas del script de I/O (`migrate-landing-page-config-to-iso-week.ts`) para poder testearlas
// sin tocar Sanity.
// 🗑️ Programado para eliminación en el milestone 2.9.0 (#1754), junto con su migración y su spec.
import { addDays, getISOWeek, getISOWeekYear, setWeek, setWeekYear, startOfWeek } from 'date-fns';

export type LandingPageDocument = { _id: string; config: string };
export type MappedDoc = { id: string; logical: string; config: string; iso: string };

// Un draft (`drafts.<id>`) y su published son el mismo documento lógico: no cuentan como colisión.
export const logicalId = (id: string): string => id.replace(/^drafts\./, '');

export const distinctLogicals = (group: MappedDoc[]): string[] => [...new Set(group.map((m) => m.logical))];

// Supuesto: un draft y su published comparten `config` (misma semana); el primero que matchea alcanza.
export const configOf = (group: MappedDoc[], logical: string): string =>
	group.find((m) => m.logical === logical)?.config ?? '';

// Mapea un slug locale YYYY-WW a su equivalente ISO-8601, anclando en el jueves de la semana locale.
export function toIsoSlug(config: string): string | null {
	const localeOptions = { weekStartsOn: 0, firstWeekContainsDate: 1 } as const;
	const localeSlug = /^(\d{4})-(\d{2})$/;
	const match = config?.match(localeSlug);
	if (!match) {
		return null;
	}
	const [, year, week] = match;
	// La fecha base es irrelevante: setWeekYear/setWeek la reemplazan por completo.
	const inWeek = setWeek(setWeekYear(new Date(2025, 5, 15), Number(year), localeOptions), Number(week), localeOptions);
	const thursday = addDays(startOfWeek(inWeek, { weekStartsOn: 0 }), 4);
	return `${getISOWeekYear(thursday)}-${getISOWeek(thursday).toString().padStart(2, '0')}`;
}

export function mapDocuments(docs: LandingPageDocument[]): { items: MappedDoc[]; skipped: LandingPageDocument[] } {
	const items: MappedDoc[] = [];
	const skipped: LandingPageDocument[] = [];
	for (const doc of docs) {
		const iso = toIsoSlug(doc.config);
		if (iso) {
			items.push({ id: doc._id, logical: logicalId(doc._id), config: doc.config, iso });
		} else {
			skipped.push(doc);
		}
	}
	return { items, skipped };
}

export function groupByIso(items: MappedDoc[]): Map<string, MappedDoc[]> {
	const groups = new Map<string, MappedDoc[]>();
	for (const item of items) {
		const group = groups.get(item.iso) ?? [];
		group.push(item);
		groups.set(item.iso, group);
	}
	return groups;
}

// Ante colisión (>1 doc lógico → mismo ISO), gana el config locale mayor (YYYY-WW ordena cronológico).
export function collisionLosers(group: MappedDoc[]): string[] {
	const logicals = distinctLogicals(group);
	if (logicals.length <= 1) {
		return [];
	}
	const winner = logicals.reduce((a, b) => (configOf(group, a) >= configOf(group, b) ? a : b));
	return logicals.filter((l) => l !== winner);
}
