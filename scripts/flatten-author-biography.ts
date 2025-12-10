/**
 * Script to migrate author biography from localized object to simple blockContent array.
 * Transforms biography from { es: [...], en: [...] } to just [...]
 * Uses the Spanish (es) version as the default content.
 */
import { client } from '../src/api/_helpers/sanity-connector';

const runMigration = async () => {
	console.log('='.repeat(60));
	console.log('Starting migration: Flattening author biographies');
	console.log('='.repeat(60));

	console.log('\n--- Fetching all authors with localized biographies ---');

	const documents = await client.fetch(
		`*[_type == 'author' && biography.es != null && !(_id in path('drafts.**'))] { _id, name, biography }`,
	);

	if (documents.length === 0) {
		console.log('No authors found with localized biographies.');
		return;
	}

	console.log(`Found ${documents.length} authors to migrate.`);
	console.log('Creating transaction to flatten biographies...');

	// Build transaction with all patches
	const transaction = documents.reduce((tx, doc) => {
		if (doc.biography?.es) {
			return tx.patch(doc._id, (patch) => patch.set({ biography: doc.biography.es }));
		}
		return tx;
	}, client.transaction());

	// Commit all patches at once
	await transaction.commit();

	console.log(`✓ Successfully flattened biographies for ${documents.length} authors`);

	console.log('\n' + '='.repeat(60));
	console.log('Migration complete!');
	console.log('='.repeat(60));
};

runMigration().catch((err) => {
	console.error('\nMigration failed:', err);
	process.exit(1);
});
