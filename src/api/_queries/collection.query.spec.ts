import { evaluate, parse } from 'groq-js';

import { collectionBySlugQuery, collectionsQuery } from './collection.query';

// Los documentos son sintéticos porque el corpus de Onoff modela el **resultado** de estas queries,
// no los documentos del content lake que las alimentan: no hay canon del que derivar esta entrada.
// Es el mismo criterio del spec de la migración de borradores.
//
// No están tipados contra los tipos de documento del typegen, así que su forma puede divergir de la
// real sin que nada avise — `coverImage` acá es un string y en el documento es un objeto de imagen.
// Alcanza para lo que estos casos verifican, que es el filtrado, el orden y los recortes, no el
// contenido de los campos. La capa de documentos del corpus es trabajo aparte.
function work(id: string, overrides: Record<string, unknown> = {}) {
	return {
		_id: id,
		_type: 'literaryWork',
		title: `Obra ${id}`,
		slug: { current: id },
		coverImage: `${id}.png`,
		content: [{ _key: 's1', title: 'Uno', body: 'Texto' }],
		...overrides,
	};
}

function reference(id: string) {
	return { _type: 'reference', _ref: id, _key: id };
}

function collection(id: string, overrides: Record<string, unknown> = {}) {
	return {
		_id: id,
		_type: 'collection',
		title: `Colección ${id}`,
		slug: { current: id },
		description: 'Prosa de la colección.',
		literaryWorks: [reference('uno')],
		...overrides,
	};
}

async function run(query: string, dataset: Record<string, unknown>[], params: Record<string, unknown> = {}) {
	const result = await evaluate(parse(query), { dataset, params });
	return result.get();
}

const works = [work('uno'), work('dos'), work('tres'), work('cuatro')];
const everyWork = [reference('uno'), reference('dos'), reference('tres'), reference('cuatro')];

describe('collectionBySlugQuery', () => {
	it('resolves the collection whose slug matches the parameter', async () => {
		const dataset = [...works, collection('geometrias'), collection('inventario')];

		const result = await run(collectionBySlugQuery, dataset, { slug: 'geometrias' });

		expect(result).toMatchObject({ _id: 'geometrias', slug: 'geometrias' });
	});

	it('resolves null when no collection carries the slug', async () => {
		const result = await run(collectionBySlugQuery, [...works, collection('geometrias')], { slug: 'inexistente' });

		expect(result).toBeNull();
	});

	// El sitio público sirve solo contenido publicado; un borrador que se colara acá lo expondría.
	it('leaves drafts out', async () => {
		const dataset = [...works, collection('drafts.geometrias', { slug: { current: 'geometrias' } })];

		expect(await run(collectionBySlugQuery, dataset, { slug: 'geometrias' })).toBeNull();
	});

	// No acotar el listado es la precondición de la invariante `count`, que el agregado deriva de las
	// obras que transporta: un slice acá la volvería silenciosamente el tamaño de la página.
	it('carries every literary work, uncapped', async () => {
		const dataset = [...works, collection('geometrias', { literaryWorks: everyWork })];

		const result = await run(collectionBySlugQuery, dataset, { slug: 'geometrias' });

		expect((result as { literaryWorks: unknown[] }).literaryWorks).toHaveLength(everyWork.length);
	});

	it('projects the opening section alone, not the whole body', async () => {
		const multiSection = work('uno', {
			content: [
				{ _key: 's1', title: 'Primera', body: 'Una' },
				{ _key: 's2', title: 'Segunda', body: 'Dos' },
			],
		});
		const dataset = [multiSection, collection('geometrias')];

		const result = await run(collectionBySlugQuery, dataset, { slug: 'geometrias' });
		const [first] = (result as { literaryWorks: { teaserSection: unknown[]; sectionCount: number }[] }).literaryWorks;

		expect(first?.teaserSection).toHaveLength(1);
		expect(first?.sectionCount).toBe(2);
	});

	it('defaults showAuthors to false when the config is absent', async () => {
		const result = await run(collectionBySlugQuery, [...works, collection('geometrias')], { slug: 'geometrias' });

		expect((result as { config: { showAuthors: boolean } }).config.showAuthors).toBe(false);
	});
});

describe('collectionsQuery', () => {
	it('counts the works without dereferencing them', async () => {
		const dataset = [...works, collection('geometrias', { literaryWorks: everyWork })];

		const result = (await run(collectionsQuery, dataset)) as Record<string, unknown>[];

		expect(result[0]?.['count']).toBe(everyWork.length);
		expect(result[0]).not.toHaveProperty('literaryWorks');
	});

	// La rama `sample` de imagery necesita exactamente tres portadas, y solo esas tres se resuelven.
	it('resolves the cover of the first three works alone', async () => {
		const dataset = [...works, collection('geometrias', { literaryWorks: everyWork })];

		const result = (await run(collectionsQuery, dataset)) as { literaryWorkCoverImages: string[] }[];

		expect(result[0]?.literaryWorkCoverImages).toEqual(['uno.png', 'dos.png', 'tres.png']);
	});

	it('yields an empty cover list for a collection without works', async () => {
		const dataset = [collection('vacia', { literaryWorks: [] })];

		const result = (await run(collectionsQuery, dataset)) as {
			count: number;
			literaryWorkCoverImages: string[];
		}[];

		expect(result[0]?.count).toBe(0);
		expect(result[0]?.literaryWorkCoverImages).toEqual([]);
	});

	it('orders by title ascending and leaves drafts out', async () => {
		const dataset = [
			...works,
			collection('c', { title: 'Zorro' }),
			collection('a', { title: 'Almanaque' }),
			collection('drafts.b', { title: 'Borrador' }),
		];

		const result = (await run(collectionsQuery, dataset)) as { title: string }[];

		expect(result.map(({ title }) => title)).toEqual(['Almanaque', 'Zorro']);
	});
});
