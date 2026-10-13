import { onoffDatasetMock } from '@mocks/onoff-documents.mock';
import { legacyMigrationDocuments } from './legacy-migration.scenario';

// Los specs suman el escenario a `onoffDatasetMock`: un `_id` o un slug compartido haría que el resultado
// de una query dependiera del orden del array, y no de la procedencia que los specs afirman.
describe('legacyMigrationDocuments', () => {
	const slugOf = (document: Record<string, unknown>) => (document['slug'] as { current?: string } | undefined)?.current;

	it('does not share an _id with the corpus', () => {
		const corpusIds = new Set(onoffDatasetMock.map(({ _id }) => _id));

		expect(legacyMigrationDocuments.filter(({ _id }) => corpusIds.has(_id))).toEqual([]);
	});

	it('does not share a slug with the corpus', () => {
		const corpusSlugs = new Set(onoffDatasetMock.map(slugOf).filter(Boolean));

		expect(legacyMigrationDocuments.filter((document) => corpusSlugs.has(slugOf(document)))).toEqual([]);
	});
});
