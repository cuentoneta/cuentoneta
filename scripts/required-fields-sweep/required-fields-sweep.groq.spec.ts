import { evaluate, parse } from 'groq-js';

import { buildFieldCountQueries, buildFieldCountQuery } from './required-fields-sweep.groq';
import type { RequiredFieldPath } from './required-fields-sweep.schema';

function rootField(segments: string[]): RequiredFieldPath {
	return { documentType: 'author', segments, insideArray: false };
}

async function count(query: string, dataset: unknown[]) {
	return (await evaluate(parse(query), { dataset })).get();
}

describe('buildFieldCountQuery', () => {
	it('counts the documents missing a root attribute', () => {
		expect(buildFieldCountQuery(rootField(['name'])).query).toBe('count(*[_type == "author" && !defined(name)])');
	});

	// Sin exigir el padre, un documento sin el objeto contenedor entero se contaría como incumplimiento
	// de cada uno de sus campos: el reporte diría que faltan varios datos donde falta uno.
	it('requires the parent to exist before demanding a nested attribute', () => {
		expect(buildFieldCountQuery(rootField(['nationality', 'country'])).query).toBe(
			'count(*[_type == "author" && defined(nationality) && !defined(nationality.country)])',
		);
	});

	it('counts a document with at least one incomplete item inside an array', () => {
		const field: RequiredFieldPath = { documentType: 'author', segments: ['resources', 'url'], insideArray: true };

		expect(buildFieldCountQuery(field).query).toBe(
			'count(*[_type == "author" && count(resources[!defined(url)]) > 0])',
		);
	});

	it('labels the field by its full path', () => {
		expect(buildFieldCountQuery(rootField(['nationality', 'country'])).label).toBe('author.nationality.country');
	});

	it('builds one query per field', () => {
		expect(buildFieldCountQueries([rootField(['name']), rootField(['biography'])])).toHaveLength(2);
	});

	// Un identificador que no lo sea produciría una query sintácticamente válida que cuenta otra cosa:
	// el error tiene que nombrar el valor, no aparecer como un conteo raro semanas después.
	it('rejects a field name that is not an identifier', () => {
		expect(() => buildFieldCountQuery(rootField(['name"] && 1 == 1 && ["']))).toThrow(/nombre de campo inesperado/);
	});

	it('rejects a document type that is not an identifier', () => {
		const field: RequiredFieldPath = { documentType: 'author"]|| *[', segments: ['name'], insideArray: false };

		expect(() => buildFieldCountQuery(field)).toThrow(/tipo de documento inesperado/);
	});
});

// Las consultas se evalúan de verdad: una que cuente de más o de menos es indistinguible de una
// correcta si solo se compara su texto.
describe('the generated queries, evaluated', () => {
	const dataset = [
		{ _id: 'a', _type: 'author', name: 'Con nombre', nationality: { country: 'Argentina' } },
		{ _id: 'b', _type: 'author', nationality: { country: 'Uruguay' } },
		{ _id: 'c', _type: 'author', name: 'Sin nacionalidad' },
		{ _id: 'd', _type: 'story', title: 'De otro tipo' },
	];

	it('counts only the documents of its own type that miss the attribute', async () => {
		expect(await count(buildFieldCountQuery(rootField(['name'])).query, dataset)).toBe(1);
	});

	it('does not count a document that lacks the parent object entirely', async () => {
		expect(await count(buildFieldCountQuery(rootField(['nationality', 'country'])).query, dataset)).toBe(0);
	});

	it('counts the document whose parent exists but whose nested attribute is missing', async () => {
		const withEmptyParent = [...dataset, { _id: 'e', _type: 'author', name: 'x', nationality: {} }];

		expect(await count(buildFieldCountQuery(rootField(['nationality', 'country'])).query, withEmptyParent)).toBe(1);
	});

	it('counts a document with one complete and one incomplete item in the same array', async () => {
		const field: RequiredFieldPath = { documentType: 'author', segments: ['resources', 'url'], insideArray: true };
		const withResources = [
			{ _id: 'f', _type: 'author', resources: [{ url: 'https://x' }, { title: 'sin url' }] },
			{ _id: 'g', _type: 'author', resources: [{ url: 'https://y' }] },
		];

		expect(await count(buildFieldCountQuery(field).query, withResources)).toBe(1);
	});
});
