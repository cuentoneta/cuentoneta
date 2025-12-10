/**
 * Script to migrate author biography from localized object to simple blockContent array.
 * Transforms biography from { es: [...], en: [...] } to just [...]
 * Uses the Spanish (es) version as the default content.
 */
import { client } from '../src/api/_helpers/sanity-connector';

const fetchDocuments = () =>
	client.fetch(
		`*[_type == 'author' && biography.es != null && !(_id in path('drafts.**'))][0...25] { _id, _rev, name, biography }`,
	);

const migrateDocument = async (doc: any) => {
	if (!doc.biography?.es) {
		return { success: false, reason: 'No Spanish biography found' };
	}

	try {
		// Remove the revision ID check - we're processing each document individually
		// and the query already excludes drafts, so conflicts should be rare
		await client.patch(doc._id).set({ biography: doc.biography.es }).commit();

		return { success: true };
	} catch (error: any) {
		console.error(`Error migrating ${doc._id}:`, error.message);
		return { success: false, reason: error.message };
	}
};

const migrateNextBatch = async (): Promise<any> => {
	const documents = await fetchDocuments();

	if (documents.length === 0) {
		console.log('No more documents to migrate!');
		return null;
	}

	console.log(`\nMigrating batch of ${documents.length} documents...`);

	let successCount = 0;
	let skipCount = 0;

	for (const doc of documents) {
		const result = await migrateDocument(doc);
		if (result.success) {
			console.log(`✓ Migrated: ${doc.name} (${doc._id})`);
			successCount++;
		} else {
			console.log(`⊘ Skipped: ${doc.name} (${doc._id}) - ${result.reason}`);
			skipCount++;
		}
	}

	console.log(`\nBatch complete: ${successCount} migrated, ${skipCount} skipped`);

	return migrateNextBatch();
};

migrateNextBatch().catch((err) => {
	console.error('\nMigration failed:', err);
	process.exit(1);
});
