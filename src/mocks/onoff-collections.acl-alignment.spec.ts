import type { Collection } from '@models/collection.model';
import type { SanityClient } from '@sanity/client';
import { fn } from '@test-utils';
import { SanityCollectionRepository } from '../api/modules/collection/collection.repository.sanity';
import { onoffCollectionsMock } from './onoff-collections.mock';
import { onoffRawCollectionsMock } from './onoff-raw-collections.mock';

// Ver el spec homónimo de `LiteraryWork` para el porqué de cada normalización: los campos que el ACL
// resuelve con `urlFor` y los títulos de sección, que llevan una función y se comparan por referencia.
function comparable(collection: Collection): unknown {
	return {
		...collection,
		imagery: undefined,
		literaryWorks: collection.literaryWorks.map((work) => ({
			...work,
			coverImage: undefined,
			// `epigraphs` queda fuera porque la proyección de teaser no los trae: el ACL ni siquiera declara la
			// clave y el corpus la declara vacía, que significan lo mismo pero no comparan igual.
			teaserSection: {
				...work.teaserSection,
				title: work.teaserSection.title?.value,
				epigraphs: undefined,
			},
			authors: work.authors.map((author) => ({
				...author,
				imageUrl: undefined,
				nationality: { ...author.nationality, flag: undefined },
			})),
			mediaSources: work.mediaSources.map((media) => {
				const data = media.data as Record<string, unknown>;
				return 'hostAvatar' in data ? { ...media, data: { ...data, hostAvatar: undefined } } : media;
			}),
		})),
	};
}

function repoReturning(raw: unknown): SanityCollectionRepository {
	const client = { fetch: fn(() => Promise.resolve(raw)) } as unknown as SanityClient;
	return new SanityCollectionRepository(client);
}

describe('el corpus de dominio de Collection coincide con el mapeo del ACL', () => {
	it.each(onoffRawCollectionsMock.map((raw) => raw.slug))('maps the raw of "%s" into its domain mock', async (slug) => {
		const raw = onoffRawCollectionsMock.find((candidate) => candidate.slug === slug);
		const expected = onoffCollectionsMock.find((collection) => collection.slug === slug);
		const mapped = await repoReturning(raw).fetchBySlug(slug);

		expect(mapped).toBeDefined();
		expect(expected).toBeDefined();
		expect(comparable(mapped as Collection)).toEqual(comparable(expected as Collection));
	});
});
