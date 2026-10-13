import { evaluate, parse } from 'groq-js';
import { onoffDatasetMock, onoffLiteraryWorkDocumentsMock } from '@mocks/onoff-documents.mock';
import { MIGRATED_ID_PREFIX } from '@api/modules/legacy-route/legacy-route.constants';
import { legacyMigrationDocuments, legacyMigrationPairs } from '@testing/legacy-migration.scenario';
import { migratedCollectionSlugQuery, migratedLiteraryWorkSlugQuery } from './legacy-route.query';

async function resolve(
	kind: keyof typeof MIGRATED_ID_PREFIX,
	legacySlug: string,
	dataset: unknown[] = [...onoffDatasetMock, ...legacyMigrationDocuments],
): Promise<string | null> {
	const query = { story: migratedLiteraryWorkSlugQuery, storylist: migratedCollectionSlugQuery }[kind];
	const params = { legacySlug, migratedIdPrefix: MIGRATED_ID_PREFIX[kind] };
	return (await (await evaluate(parse(query), { dataset, params })).get()) as string | null;
}

describe('legacy route queries', () => {
	// La cadena de renombres incluida: el slug viejo de una obra es el vigente de otra, y la resolución
	// tiene que seguir la procedencia, no el slug.
	it.each(legacyMigrationPairs.map((pair) => [pair.origin.slug.current, pair] as const))(
		'resolves the legacy slug %s to the document migrated from its origin',
		async (_, { kind, origin, migrated }) => {
			expect(migrated._id).toBe(`${MIGRATED_ID_PREFIX[kind]}${origin._id}`);
			expect(await resolve(kind, origin.slug.current)).toBe(migrated.slug.current);
		},
	);

	it('returns null for a slug without an origin', async () => {
		expect(await resolve('story', 'onoff-sin-origen')).toBeNull();
	});

	// Una obra creada después de la migración tiene slug pero no procedencia: no hay a dónde resolver.
	it('does not resolve a literary work that has no provenance', async () => {
		const [canonLiteraryWork] = onoffLiteraryWorkDocumentsMock;

		expect(await resolve('story', canonLiteraryWork.slug.current)).toBeNull();
	});

	it('ignores an origin that only exists as a draft', async () => {
		const [{ origin, migrated }] = legacyMigrationPairs;
		const draftOrigin = { ...origin, _id: `drafts.${origin._id}` };

		expect(await resolve('story', origin.slug.current, [draftOrigin, migrated])).toBeNull();
	});

	// El prefijo es lo que separa los tipos: un slug viejo de obra no resuelve a una colección.
	it('does not cross the provenance of one kind into the other', async () => {
		const storylist = legacyMigrationPairs.find(({ kind }) => kind === 'storylist');

		expect(await resolve('story', storylist?.origin.slug.current ?? '')).toBeNull();
	});
});
