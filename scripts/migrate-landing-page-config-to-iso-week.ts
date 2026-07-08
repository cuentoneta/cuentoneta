/**
 * Migración única (#1751): re-sluggea `config` y `slug.current` de TODOS los documentos landingPage
 * de numeración de semana LOCAL (default de date-fns: domingo = día 1, semana del 1° de enero) a
 * ISO-8601 (lunes = día 1, semana del primer jueves). La lógica pura del mapeo vive en
 * `iso-week-mapping.ts`; acá solo el I/O contra Sanity.
 *
 * Para casi toda semana el número no cambia; solo diverge en algunos bordes de año, donde además
 * dos semanas locale pueden mapear al mismo destino ISO (colisión).
 *
 * ⚠️ EJECUTAR UNA SOLA VEZ. No es idempotente: el formato viejo (locale YYYY-WW) y el nuevo
 * (ISO YYYY-WW) son indistinguibles, así que re-aplicar volvería a desplazar las semanas de borde
 * de año. Correr SIEMPRE el dry-run primero y revisar el reporte (incluido el respaldo de colisiones).
 *
 * Uso:
 *   node --import tsx --env-file=.env ./scripts/migrate-landing-page-config-to-iso-week.ts                       # dry-run
 *   node --import tsx --env-file=.env ./scripts/migrate-landing-page-config-to-iso-week.ts --apply
 *   node --import tsx --env-file=.env ./scripts/migrate-landing-page-config-to-iso-week.ts --apply --resolve=latest-wins
 */
import { client } from '../src/api/_helpers/sanity-connector';
import type { Transaction } from '@sanity/client';
import type { LandingPageDocument, MappedDoc } from './iso-week-mapping';
import { collisionLosers, configOf, distinctLogicals, groupByIso, mapDocuments } from './iso-week-mapping';

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

// Antes de borrar un perdedor de colisión, vuelca su contenido completo para poder recuperarlo.
async function backupAndDelete(transaction: Transaction, ids: string[]): Promise<void> {
	const docs = await client.fetch<unknown[]>(`*[_id in $ids]`, { ids });
	console.log(`\n⚠️  Se borran ${ids.length} documento(s) por colisión. Respaldo (revisar antes de confirmar):`);
	console.log(JSON.stringify(docs, null, 2));
	for (const id of ids) {
		transaction.delete(id);
	}
}

async function applyMigration(groups: Map<string, MappedDoc[]>, resolveLatest: boolean): Promise<void> {
	const hasCollisions = [...groups.values()].some((group) => distinctLogicals(group).length > 1);
	if (hasCollisions && !resolveLatest) {
		console.error('\n✗ Hay colisiones y no se pasó --resolve=latest-wins. Abortando sin escribir.');
		process.exit(1);
	}

	const transaction = client.transaction();
	const toDelete: string[] = [];
	for (const [, group] of groups) {
		const losers = collisionLosers(group);
		for (const item of group) {
			if (losers.includes(item.logical)) {
				toDelete.push(item.id);
			} else if (item.config !== item.iso) {
				console.log(`  ✓ ${item.id}: ${item.config} → ${item.iso}`);
				transaction.patch(item.id, { set: { config: item.iso, 'slug.current': item.iso } });
			}
		}
	}

	if (toDelete.length > 0) {
		await backupAndDelete(transaction, toDelete);
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
