/**
 * Migración única (#1751): re-sluggea `config` y `slug.current` de TODOS los documentos landingPage
 * de numeración de semana LOCAL (default de date-fns: domingo = día 1, semana del 1° de enero) a
 * ISO-8601 (lunes = día 1, semana del primer jueves). El slug no guarda la fecha, así que por cada
 * semana locale se reconstruye una fecha representativa, se ancla en su JUEVES (el criterio con el
 * que ISO decide a qué semana/año pertenece) y se recalcula la semana/año ISO.
 *
 * Para casi toda semana el número no cambia; solo diverge en algunos bordes de año, donde además
 * dos semanas locale pueden mapear al mismo destino ISO (colisión).
 *
 * ⚠️ EJECUTAR UNA SOLA VEZ. No es idempotente: el formato viejo (locale YYYY-WW) y el nuevo
 * (ISO YYYY-WW) son indistinguibles, así que re-aplicar volvería a desplazar las semanas de borde
 * de año. Correr SIEMPRE el dry-run primero y revisar el reporte.
 *
 * Uso:
 *   node --import tsx --env-file=.env ./scripts/migrate-landing-page-config-to-iso-week.ts                       # dry-run
 *   node --import tsx --env-file=.env ./scripts/migrate-landing-page-config-to-iso-week.ts --apply
 *   node --import tsx --env-file=.env ./scripts/migrate-landing-page-config-to-iso-week.ts --apply --resolve=latest-wins
 */
import { client } from '../src/api/_helpers/sanity-connector';
import { addDays, getISOWeek, getISOWeekYear, setWeek, setWeekYear, startOfWeek } from 'date-fns';

type LandingPageDocument = { _id: string; config: string };
type MappedDoc = { id: string; logical: string; config: string; iso: string };

const LOCALE_OPTIONS = { weekStartsOn: 0, firstWeekContainsDate: 1 } as const;
const LOCALE_SLUG = /^(\d{4})-(\d{2})$/;

const pad = (n: number) => n.toString().padStart(2, '0');
// Un draft (`drafts.<id>`) y su published son el mismo documento lógico: no cuentan como colisión.
const logicalId = (id: string) => id.replace(/^drafts\./, '');
const configOf = (group: MappedDoc[], logical: string): string =>
	group.find((m) => m.logical === logical)?.config ?? '';
const distinctLogicals = (group: MappedDoc[]): string[] => [...new Set(group.map((m) => m.logical))];

// Mapea un slug locale YYYY-WW a su equivalente ISO-8601, anclando en el jueves de la semana locale.
function toIsoSlug(config: string): string | null {
	const match = config?.match(LOCALE_SLUG);
	if (!match) {
		return null;
	}
	const [, year, week] = match;
	const inWeek = setWeek(
		setWeekYear(new Date(2025, 5, 15), Number(year), LOCALE_OPTIONS),
		Number(week),
		LOCALE_OPTIONS,
	);
	const thursday = addDays(startOfWeek(inWeek, { weekStartsOn: 0 }), 4);
	return `${getISOWeekYear(thursday)}-${pad(getISOWeek(thursday))}`;
}

function mapDocuments(docs: LandingPageDocument[]): { items: MappedDoc[]; skipped: LandingPageDocument[] } {
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

function groupByIso(items: MappedDoc[]): Map<string, MappedDoc[]> {
	const groups = new Map<string, MappedDoc[]>();
	for (const item of items) {
		const group = groups.get(item.iso) ?? [];
		group.push(item);
		groups.set(item.iso, group);
	}
	return groups;
}

// Ante colisión (>1 doc lógico → mismo ISO), gana el config locale mayor (YYYY-WW ordena cronológico).
function collisionLosers(group: MappedDoc[]): string[] {
	const logicals = distinctLogicals(group);
	if (logicals.length <= 1) {
		return [];
	}
	const winner = logicals.reduce((a, b) => (configOf(group, a) >= configOf(group, b) ? a : b));
	return logicals.filter((l) => l !== winner);
}

function printReport(
	total: number,
	items: MappedDoc[],
	skipped: LandingPageDocument[],
	groups: Map<string, MappedDoc[]>,
): void {
	console.log(`Documentos: ${total} (mapeables: ${items.length}, sin formato locale: ${skipped.length})`);
	skipped.forEach((d) => console.log(`  ⊘ ${d._id}: config "${d.config}" no matchea YYYY-WW`));

	const changed = items.filter((m) => m.config !== m.iso);
	console.log(`\nCambian: ${changed.length} · sin cambio: ${items.length - changed.length}`);
	changed.forEach((m) => console.log(`  ~ ${m.id}: ${m.config} → ${m.iso}`));

	const collisions = [...groups].filter(([, group]) => distinctLogicals(group).length > 1);
	if (collisions.length === 0) {
		console.log('\nSin colisiones.');
		return;
	}
	console.log(`\n⚠️  COLISIONES: ${collisions.length}`);
	collisions.forEach(([iso, group]) =>
		console.log(
			`  ${iso} ← ${distinctLogicals(group)
				.map((l) => `${l} (${configOf(group, l)})`)
				.join(', ')}`,
		),
	);
}

async function applyMigration(groups: Map<string, MappedDoc[]>, resolveLatest: boolean): Promise<void> {
	const hasCollisions = [...groups.values()].some((group) => distinctLogicals(group).length > 1);
	if (hasCollisions && !resolveLatest) {
		console.error('\n✗ Hay colisiones y no se pasó --resolve=latest-wins. Abortando sin escribir.');
		process.exit(1);
	}

	const transaction = client.transaction();
	for (const [iso, group] of groups) {
		const losers = collisionLosers(group);
		for (const item of group) {
			if (losers.includes(item.logical)) {
				console.log(`  ✗ borra ${item.id} (colisión en ${iso})`);
				transaction.delete(item.id);
			} else if (item.config !== item.iso) {
				console.log(`  ✓ ${item.id}: ${item.config} → ${item.iso}`);
				transaction.patch(item.id, { set: { config: item.iso, 'slug.current': item.iso } });
			}
		}
	}
	await transaction.commit();
	console.log('\n✓ Migración aplicada.');
}

async function runMigration(): Promise<void> {
	const apply = process.argv.includes('--apply');
	const resolveLatest = process.argv.includes('--resolve=latest-wins');

	const docs = await client.fetch<LandingPageDocument[]>(`*[_type == 'landingPage']{ _id, config }`);
	if (docs.length === 0) {
		console.log('No hay documentos landingPage.');
		return;
	}

	const { items, skipped } = mapDocuments(docs);
	const groups = groupByIso(items);
	printReport(docs.length, items, skipped, groups);

	if (!apply) {
		console.log('\n[DRY-RUN] No se escribió nada. Re-correr con --apply para aplicar.');
		return;
	}
	await applyMigration(groups, resolveLatest);
}

runMigration().catch((err) => {
	console.error('\nLa migración falló:', err);
	process.exit(1);
});
