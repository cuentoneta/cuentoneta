import { evaluate, parse } from 'groq-js';
import { incompleteLiteraryWorkDocument } from '@mocks/onoff-documents.mock';

import { literaryWorkBySlugQuery } from './literary-work.query';

async function run(query: string, dataset: unknown[], params: Record<string, unknown> = {}) {
	const result = await evaluate(parse(query), { dataset, params });
	return result.get();
}

interface DefaultedFields {
	badLanguage: unknown;
	originalPublication: unknown;
	totalReadingTime: unknown;
}

describe('literary-work.query defaults', () => {
	// `totalReadingTime` se afirma `null` a propósito: es el único de los tres sin `coalesce`, porque no
	// hay valor por defecto honesto — un `0` leería como "0 minutos de lectura" para un cuerpo de miles
	// de caracteres, y ese dato inventado es peor que una ausencia detectable. El consumidor lo resuelve
	// con un guard, no la query.
	it('literaryWorkBySlugQuery defaults the two fields it can, and leaves reading time absent', async () => {
		const result = (await run(literaryWorkBySlugQuery, [incompleteLiteraryWorkDocument], {
			slug: incompleteLiteraryWorkDocument.slug.current,
		})) as DefaultedFields | null;

		expect(result?.badLanguage).toBe(false);
		expect(result?.originalPublication).toBe('');
		expect(result?.totalReadingTime).toBeNull();
	});

	// Hueco declarado, no silencioso: `literaryWorkSectionBySlugQuery` comparte la misma proyección de
	// metadata que la de arriba, pero recorta `content` con `[$section...$sectionEnd]`. El intérprete de
	// `groq-js` (a diferencia de la API real de Sanity) exige que los límites de un slice sean literales
	// constantes, y falla al *parsear* la query entera —`GroqQueryError: slicing must use constant
	// numbers`— sin importar los params ni el dataset. No hay forma de evaluarla aislada con esta
	// herramienta; la cobertura de sus tres campos queda acreditada por la proyección de arriba, que es
	// idéntica salvo el recorte.
});
