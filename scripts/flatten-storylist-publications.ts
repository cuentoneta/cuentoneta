/**
 * Script para aplanar la estructura de publicaciones de storylists.
 *
 * Cambios realizados:
 * 1. Transforma publicaciones de: [{story, publishingOrder, publishingDate, published}]
 *    A: stories: [referencias de historias con _key único]
 * 2. El orden del array se determina por el campo publishingOrder
 * 3. Elimina campos deprecados: displayDates, comingNextLabel, editionPrefix, publications
 */
import { randomUUID } from 'node:crypto';
import { getClient } from '../src/api/_helpers/sanity-connector';

const runMigration = async () => {
	console.log('='.repeat(60));
	console.log('Flattening storylist publications structure');
	console.log('='.repeat(60));

	console.log('\n--- Fetching all storylists ---');

	const storylists = await getClient().fetch(`
    *[_type == 'storylist' && !(_id in path('drafts.**'))] {
      _id,
      title,
      'publications': publications[]{
        publishingOrder,
        'storyRef': story._ref
      }
    }
  `);

	if (storylists.length === 0) {
		console.log('No storylists found.');
		return;
	}

	console.log(`Found ${storylists.length} storylists to migrate.`);
	console.log('Creating transaction to flatten publications...');

	const transaction = storylists.reduce((tx: any, doc: any) => {
		if (!doc.publications || doc.publications.length === 0) {
			console.log(`  ⊘ Skipping "${doc.title}" - no publications`);
			return tx;
		}

		// Sort by publishingOrder and extract story references
		const sortedRefs = doc.publications
			.filter((p: any) => p.storyRef) // Filter out any nulls
			.sort((a: any, b: any) => (a.publishingOrder || 0) - (b.publishingOrder || 0))
			.map((p: any) => ({
				_key: randomUUID(),
				_type: 'reference',
				_ref: p.storyRef,
			}));

		console.log(`  ✓ Migrating "${doc.title}" - ${sortedRefs.length} stories`);

		return tx.patch(doc._id, (patch: any) =>
			patch.set({ stories: sortedRefs }).unset(['displayDates', 'comingNextLabel', 'editionPrefix', 'publications']),
		);
	}, getClient().transaction());

	await transaction.commit();

	console.log(`\n✓ Successfully migrated ${storylists.length} storylists`);
	console.log('='.repeat(60));
	console.log('Migration complete!');
	console.log('='.repeat(60));
};

runMigration().catch((err) => {
	console.error('\nMigration failed:', err);
	process.exit(1);
});
