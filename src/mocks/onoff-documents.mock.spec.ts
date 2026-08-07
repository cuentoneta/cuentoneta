import { evaluate, parse } from 'groq-js';
import { collectionBySlugQuery, collectionsQuery } from '../api/_queries/collection.query';
import { literaryWorkBySlugQuery } from '../api/_queries/literary-work.query';
import { onoffRawCollectionsMock, onoffRawCollectionTeasersMock } from './onoff-raw-collections.mock';
import { onoffRawLiteraryWorksMock } from './onoff-raw-literary-works.mock';
import { onoffDatasetMock } from './onoff-documents.mock';

async function run(query: string, params: Record<string, unknown> = {}) {
	const result = await evaluate(parse(query), { dataset: onoffDatasetMock, params });
	return result.get();
}

// El gate de frescura del corpus generado. Las fixtures crudas commiteadas las escribió
// `pnpm corpus:generate` evaluando estas mismas queries sobre estos mismos documentos: si alguien toca un
// documento y no regenera, lo commiteado deja de ser lo que la query devuelve y estos casos cortan.
//
// Compara valores y no bytes a propósito — el formato lo fija Prettier dentro del generador, así que un
// desvío de formato no es una desincronización; una diferencia de valor sí.
describe('las fixtures crudas son lo que la query devuelve sobre los documentos', () => {
	it.each(onoffRawCollectionsMock.map((collection) => collection.slug))(
		'evaluates the collection query for "%s" into its raw fixture',
		async (slug) => {
			const expected = onoffRawCollectionsMock.find((collection) => collection.slug === slug);

			await expect(run(collectionBySlugQuery, { slug })).resolves.toStrictEqual(expected);
		},
	);

	it.each(onoffRawLiteraryWorksMock.map((work) => work.slug))(
		'evaluates the literary work query for "%s" into its raw fixture',
		async (slug) => {
			const expected = onoffRawLiteraryWorksMock.find((work) => work.slug === slug);

			await expect(run(literaryWorkBySlugQuery, { slug })).resolves.toStrictEqual(expected);
		},
	);

	// Sin reordenar el esperado: el archivo generado se commitea en el orden que devuelve la query, así que
	// el caso afirma también el orden —por título y por codepoint— y no solo los valores.
	it('evaluates the listing query into the raw teaser fixtures', async () => {
		const result = await run(collectionsQuery);

		expect(result).toStrictEqual(onoffRawCollectionTeasersMock);
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
