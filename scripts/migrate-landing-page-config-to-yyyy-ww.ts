// Migración única (#1749): reordena el formato de `config` y `slug.current` de los documentos
// landingPage de `WW-YYYY` a `YYYY-WW`, para que el orden lexicográfico coincida con el cronológico.
//
// Es un reordenamiento de string puro sobre el valor ya curado: NO recalcula el número de semana ni
// re-deriva desde ninguna fecha, para no alterar el significado editorial de "semana N" ya asignado.
// Incluye borradores (drafts) para que un documento en edición no quede en formato inconsistente
// respecto de su versión publicada.
//
// Ejecutar manualmente durante la ventana de corte del despliegue:
//   node --import tsx --env-file=.env ./scripts/migrate-landing-page-config-to-yyyy-ww.ts

import { client } from '../src/api/_helpers/sanity-connector';
import type { Transaction } from '@sanity/client';

type LandingPageDocument = { _id: string; config: string };

const OLD_CONFIG_PATTERN = /^(\d{2})-(\d{4})$/;

const fetchLandingPages = () =>
	client.fetch<LandingPageDocument[]>(`
  *[_type == 'landingPage']{ _id, config }
`);

const buildMigration = (documents: LandingPageDocument[]): { transaction: Transaction; migratedCount: number } => {
	let migratedCount = 0;

	const transaction = documents.reduce((tx, doc) => {
		const match = doc.config?.match(OLD_CONFIG_PATTERN);
		if (!match) {
			console.log(`  ⊘ Se omite ${doc._id} — config "${doc.config}" no coincide con WW-YYYY`);
			return tx;
		}

		const [, week, year] = match;
		const newConfig = `${year}-${week}`;
		console.log(`  ✓ ${doc._id}: "${doc.config}" → "${newConfig}"`);
		migratedCount++;

		return tx.patch(doc._id, { set: { config: newConfig, 'slug.current': newConfig } });
	}, client.transaction());

	return { transaction, migratedCount };
};

const runMigration = async () => {
	console.log('Migrando config/slug de landingPage de WW-YYYY a YYYY-WW…');

	const documents = await fetchLandingPages();
	if (documents.length === 0) {
		console.log('No hay documentos landingPage para migrar.');
		return;
	}

	const { transaction, migratedCount } = buildMigration(documents);
	if (migratedCount === 0) {
		console.log('Ningún documento en formato WW-YYYY: nada que migrar.');
		return;
	}

	await transaction.commit();
	console.log(`\n✓ Migrados ${migratedCount} de ${documents.length} documentos landingPage.`);
};

runMigration().catch((err) => {
	console.error('\nLa migración falló:', err);
	process.exit(1);
});
