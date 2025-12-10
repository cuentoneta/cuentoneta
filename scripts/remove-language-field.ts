/**
 * Script to remove the 'language' field from all story and storylist documents.
 * The language attribute was removed from the schemas and needs to be unset from existing documents.
 */
import { client } from '../src/api/_helpers/sanity-connector';

const fetchStoryDocuments = () =>
	client.fetch(
		`*[_type == 'story' && defined(language) && !(_id in path('drafts.**'))][0...25] { _id, title, language }`,
	);

const fetchStorylistDocuments = () =>
	client.fetch(
		`*[_type == 'storylist' && defined(language) && !(_id in path('drafts.**'))][0...25] { _id, title, language }`,
	);

const migrateDocument = async (doc: any, docType: string) => {
	try {
		await client.patch(doc._id).unset(['language']).commit();

		return { success: true };
	} catch (error: any) {
		console.error(`Error migrating ${docType} ${doc._id}:`, error.message);
		return { success: false, reason: error.message };
	}
};

const migrateBatch = async (docType: 'story' | 'storylist') => {
	const fetchFn = docType === 'story' ? fetchStoryDocuments : fetchStorylistDocuments;
	const documents = await fetchFn();

	if (documents.length === 0) {
		return { migrated: 0, skipped: 0 };
	}

	console.log(`\nMigrating batch of ${documents.length} ${docType} documents...`);

	let successCount = 0;
	let skipCount = 0;

	for (const doc of documents) {
		const result = await migrateDocument(doc, docType);
		if (result.success) {
			console.log(`✓ Removed language field from: ${doc.title} (${doc._id})`);
			successCount++;
		} else {
			console.log(`⊘ Skipped: ${doc.title} (${doc._id}) - ${result.reason}`);
			skipCount++;
		}
	}

	return { migrated: successCount, skipped: skipCount };
};

const migrateAllBatches = async (docType: 'story' | 'storylist'): Promise<void> => {
	let totalMigrated = 0;
	let totalSkipped = 0;

	// eslint-disable-next-line no-constant-condition
	while (true) {
		const result = await migrateBatch(docType);
		totalMigrated += result.migrated;
		totalSkipped += result.skipped;

		if (result.migrated === 0 && result.skipped === 0) {
			console.log(`\nNo more ${docType} documents to migrate.`);
			break;
		}
	}

	console.log(`\n${docType.toUpperCase()} - Total: ${totalMigrated} migrated, ${totalSkipped} skipped`);
};

const runMigration = async () => {
	console.log('='.repeat(60));
	console.log('Starting migration: Removing language field from documents');
	console.log('='.repeat(60));

	console.log('\n--- Migrating STORY documents ---');
	await migrateAllBatches('story');

	console.log('\n--- Migrating STORYLIST documents ---');
	await migrateAllBatches('storylist');

	console.log('\n' + '='.repeat(60));
	console.log('Migration complete!');
	console.log('='.repeat(60));
};

runMigration().catch((err) => {
	console.error('\nMigration failed:', err);
	process.exit(1);
});
