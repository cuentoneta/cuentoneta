import { evaluate, parse } from 'groq-js';
import {
	incompleteLegacyStoryDocument,
	landingPageWithIncompleteStoryDocument,
	rotatingContentWithIncompleteStoryDocument,
	storylistWithIncompleteStoryDocument,
} from '@mocks/onoff-documents.mock';

import { rotatingContentQuery, landingPageContentQuery } from './content.query';
import { storyBySlugQuery, storiesBySlugsQuery } from './story.query';
import { storylistQuery } from './storylist.query';

async function run(query: string, dataset: unknown[], params: Record<string, unknown> = {}) {
	const result = await evaluate(parse(query), { dataset, params });
	return result.get();
}

interface DefaultedFields {
	badLanguage: unknown;
	originalPublication: unknown;
	approximateReadingTime: unknown;
}

// Las tres aserciones que importan en cada proyección. `approximateReadingTime` se afirma `null` a
// propósito: es el único de los tres sin `coalesce`, porque no hay valor por defecto honesto — un `0`
// leería como "0 minutos de lectura" para un cuerpo de miles de caracteres, y ese dato inventado es peor
// que una ausencia detectable. El consumidor lo resuelve con un guard, no la query.
function expectDefaultedFields(story: DefaultedFields | null | undefined) {
	expect(story?.badLanguage).toBe(false);
	expect(story?.originalPublication).toBe('');
	expect(story?.approximateReadingTime).toBeNull();
}

describe('story.query defaults', () => {
	it('storyBySlugQuery defaults the three fields for a story missing them', async () => {
		const result = await run(storyBySlugQuery, [incompleteLegacyStoryDocument], {
			slug: incompleteLegacyStoryDocument.slug.current,
		});

		expectDefaultedFields(result as DefaultedFields);
	});

	it('storiesBySlugsQuery defaults the three fields for a story missing them', async () => {
		const [result] = (await run(storiesBySlugsQuery, [incompleteLegacyStoryDocument], {
			slugs: [incompleteLegacyStoryDocument.slug.current],
		})) as DefaultedFields[];

		expectDefaultedFields(result);
	});

	// Hueco declarado, no silencioso: `storiesByAuthorSlugQuery` y `allStoriesQuery` comparten la misma
	// forma de proyección que las dos de arriba, pero paginan con `[$start...$end]`. El intérprete de
	// `groq-js` (a diferencia de la API real de Sanity) exige que los límites de un slice sean literales
	// constantes, y falla al *parsear* la query entera —`GroqQueryError: slicing must use constant
	// numbers`— sin importar los params ni el dataset. No hay forma de evaluarlas aisladas con esta
	// herramienta; la cobertura de sus tres campos queda acreditada por las otras dos proyecciones, que
	// son idénticas salvo la paginación.
});

describe('storylist.query defaults', () => {
	it('storylistQuery defaults the three fields for a dereferenced story missing them', async () => {
		const result = (await run(storylistQuery, [storylistWithIncompleteStoryDocument, incompleteLegacyStoryDocument], {
			slug: storylistWithIncompleteStoryDocument.slug.current,
		})) as { stories: DefaultedFields[] };

		expectDefaultedFields(result.stories[0]);
	});
});

describe('content.query defaults', () => {
	it('rotatingContentQuery defaults the three fields for a dereferenced story missing them', async () => {
		const result = (await run(rotatingContentQuery, [
			rotatingContentWithIncompleteStoryDocument,
			incompleteLegacyStoryDocument,
		])) as { mostRead: DefaultedFields[] };

		expectDefaultedFields(result.mostRead[0]);
	});

	it('landingPageContentQuery defaults the three fields for a dereferenced story missing them', async () => {
		const result = (await run(
			landingPageContentQuery,
			[landingPageWithIncompleteStoryDocument, incompleteLegacyStoryDocument],
			{ slug: landingPageWithIncompleteStoryDocument.slug.current },
		)) as { latestReads: DefaultedFields[] };

		expectDefaultedFields(result.latestReads[0]);
	});
});
