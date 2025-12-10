/**
 * Script to remove the 'language' field from all story and storylist documents.
 * The language attribute was removed from the schemas and needs to be unset from existing documents.
 */
import { client } from '../src/api/_helpers/sanity-connector';

const migrateDocType = async (docType: 'story' | 'storylist') => {
	console.log(`\n--- Fetching all ${docType} documents with language field ---`);

	const documents = await client.fetch(
		`*[_type == '${docType}' && defined(language) && !(_id in path('drafts.**'))] { _id, title }`,
	);

	if (documents.length === 0) {
		console.log(`No ${docType} documents found with language field.`);
		return;
	}

	console.log(`Found ${documents.length} ${docType} documents to migrate.`);
	console.log(`Creating transaction to remove language field...`);

	// Build transaction with all patches
	const transaction = documents.reduce((tx, doc) => {
		return tx.patch(doc._id, (patch) => patch.unset(['language']));
	}, client.transaction());

	// Commit all patches at once
	await transaction.commit();

	console.log(`✓ Successfully removed language field from ${documents.length} ${docType} documents`);
};

const runMigration = async () => {
	console.log('='.repeat(60));
	console.log('Starting migration: Removing language field from documents');
	console.log('='.repeat(60));

	await migrateDocType('story');
	await migrateDocType('storylist');

	console.log('\n' + '='.repeat(60));
	console.log('Migration complete!');
	console.log('='.repeat(60));
};

runMigration().catch((err) => {
	console.error('\nMigration failed:', err);
	process.exit(1);
});
