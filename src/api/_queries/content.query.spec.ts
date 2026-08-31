import { evaluate, parse } from 'groq-js';
import {
	migratedStoryDocument,
	onoffDatasetMock,
	onoffLandingPageDocumentsMock,
	onoffLiteraryWorkDocumentsMock,
	unmigratedStoryDocument,
} from '@mocks/onoff-documents.mock';

import { landingPageContentQuery } from './content.query';

async function run(query: string, dataset: unknown[], params: Record<string, unknown> = {}) {
	const result = await evaluate(parse(query), { dataset, params });
	return result.get();
}

const [landingPage] = onoffLandingPageDocumentsMock;

async function storyCountOver(dataset: unknown[]): Promise<number> {
	const result = (await run(landingPageContentQuery, dataset, { slug: landingPage.slug?.current })) as {
		highlightedAuthors: Array<{ storyCount: number }>;
	};
	return result.highlightedAuthors[0].storyCount;
}

// El conteo del autor destacado es el único dato de la proyección que no sale de dereferenciar una
// referencia: lo computa una subconsulta sobre todo el dataset, y su corrección depende de qué se
// considera "una obra" mientras dos schemas describen la misma.
describe('landingPageContentQuery — storyCount', () => {
	it('counts every work of the corpus for the highlighted author', async () => {
		expect(await storyCountOver(onoffDatasetMock)).toBe(onoffLiteraryWorkDocumentsMock.length);
	});

	// La migración copia el slug y deja el cuento en pie, así que contar documentos en vez de obras
	// devuelve el doble para todo autor ya migrado, y se lee como si hubiera publicado más.
	it('counts a migrated work once, though it exists as both a story and a literary work', async () => {
		expect(await storyCountOver([...onoffDatasetMock, migratedStoryDocument])).toBe(
			onoffLiteraryWorkDocumentsMock.length,
		);
	});

	// La contracara: quedarse solo con las obras literarias también daría bien el caso de arriba, y
	// dejaría sin contar a todo autor cuya obra todavía no migró.
	it('counts a work that still exists only as a story', async () => {
		expect(await storyCountOver([...onoffDatasetMock, unmigratedStoryDocument])).toBe(
			onoffLiteraryWorkDocumentsMock.length + 1,
		);
	});

	it('leaves the in-flight draft of a work out of the count', async () => {
		const draft = { ...unmigratedStoryDocument, _id: `drafts.${unmigratedStoryDocument._id}` };

		expect(await storyCountOver([...onoffDatasetMock, unmigratedStoryDocument, draft])).toBe(
			onoffLiteraryWorkDocumentsMock.length + 1,
		);
	});

	it('leaves out the works of authors other than the highlighted one', async () => {
		const otherAuthorWork = {
			...unmigratedStoryDocument,
			_id: 'onoff-story-de-otro-autor',
			author: { _type: 'reference' as const, _ref: 'author-ajeno' },
		};

		expect(await storyCountOver([...onoffDatasetMock, otherAuthorWork])).toBe(onoffLiteraryWorkDocumentsMock.length);
	});
});
