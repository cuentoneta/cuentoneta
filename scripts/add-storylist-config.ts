/**
 * Script to add config.showAuthors field to all existing storylist documents.
 * Sets the default value to true for all existing storylists.
 */
import { client } from '../src/api/_helpers/sanity-connector';

const runMigration = async () => {
	console.log('='.repeat(60));
	console.log('Starting migration: Adding config.showAuthors to storylists');
	console.log('='.repeat(60));

	console.log('\n--- Fetching all storylists without config field ---');

	const documents = await client.fetch(
		`*[_type == 'storylist' && !defined(config) && !(_id in path('drafts.**'))] { _id, title, slug }`,
	);

	if (documents.length === 0) {
		console.log('No storylists found without config field.');
		console.log('All storylists are already up to date!');
		return;
	}

	console.log(`Found ${documents.length} storylist(s) to migrate:`);
	documents.forEach((doc: any) => {
		console.log(`  - ${doc.title} (${doc.slug.current})`);
	});

	console.log('\nCreating transaction to add config field...');

	// Build transaction with all patches
	const transaction = documents.reduce((tx, doc) => {
		return tx.patch(doc._id, (patch) =>
			patch.set({
				config: {
					showAuthors: true,
				},
			}),
		);
	}, client.transaction());

	// Commit all patches at once
	console.log('Committing changes...');
	await transaction.commit();

	console.log(`✓ Successfully added config.showAuthors to ${documents.length} storylist(s)`);

	console.log('\n' + '='.repeat(60));
	console.log('Migration complete!');
	console.log('='.repeat(60));
};

runMigration().catch((err) => {
	console.error('\nMigration failed:', err);
	process.exit(1);
});
