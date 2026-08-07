import { evaluate, parse } from 'groq-js';
import { collectionBySlugQuery, collectionsQuery } from '../api/_queries/collection.query';
import { literaryWorkBySlugQuery } from '../api/_queries/literary-work.query';
import { onoffRawCollectionsMock } from './onoff-raw-collections.mock';
import { onoffRawLiteraryWorksMock } from './onoff-raw-literary-works.mock';
import { onoffDatasetMock } from './onoff-documents.mock';

async function run(query: string, params: Record<string, unknown> = {}) {
	const result = await evaluate(parse(query), { dataset: onoffDatasetMock, params });
	return result.get();
}

// Los documentos se derivan invirtiendo la proyección de la query. La única forma de saber que esa
// inversión no miente es volver a aplicar la query: si el resultado no reproduce el canon crudo, los
// documentos afirman un content lake que no existe.
describe('el dataset de documentos reproduce el corpus crudo', () => {
	it.each(onoffRawCollectionsMock.map((collection) => collection.slug))(
		'evaluates the collection query for "%s" into its raw fixture',
		async (slug) => {
			const expected = onoffRawCollectionsMock.find((collection) => collection.slug === slug);

			await expect(run(collectionBySlugQuery, { slug })).resolves.toEqual(expected);
		},
	);

	it.each(onoffRawLiteraryWorksMock.map((work) => work.slug))(
		'evaluates the literary work query for "%s" into its raw fixture',
		async (slug) => {
			const expected = onoffRawLiteraryWorksMock.find((work) => work.slug === slug);

			await expect(run(literaryWorkBySlugQuery, { slug })).resolves.toEqual(expected);
		},
	);

	it('evaluates the listing query into every collection of the corpus', async () => {
		const result = (await run(collectionsQuery)) as { slug: string }[];

		expect(result.map(({ slug }) => slug).sort()).toEqual(onoffRawCollectionsMock.map(({ slug }) => slug).sort());
	});

	// El modo de falla que `groq-js` no reporta: si el documento de asset no está en el dataset, la
	// dereferencia resuelve a null y el fixture derivado queda mudo sobre la diferencia.
	it('resolves the audio url of the work that carries a space recording', async () => {
		const withRecording = onoffRawLiteraryWorksMock.find((work) =>
			(work.mediaSources ?? []).some((source) => source._type === 'spaceRecording'),
		);
		const result = (await run(literaryWorkBySlugQuery, { slug: withRecording?.slug })) as {
			mediaSources: { _type: string; audioUrl?: string | null }[];
		};
		const recording = result.mediaSources.find((source) => source._type === 'spaceRecording');

		expect(recording?.audioUrl).toBeTruthy();
	});
});
