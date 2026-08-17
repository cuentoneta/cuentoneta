import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { scanRequiredFields } from './required-fields-sweep.schema';

// El schema se lee en runtime y no por import: un `import` de `cms/**` desde acá le agrega a Nx una
// dependencia de proyecto, y el build de la app pasa a exigir el del Studio, que tiene su propio
// `node_modules` y no se instala en ese job.
const schema = JSON.parse(readFileSync(join(process.cwd(), 'cms', 'schema.json'), 'utf8'));

function pathsOf(documentType: string) {
	return scanRequiredFields(schema as never)
		.required.filter((field) => field.documentType === documentType)
		.map((field) => field.segments.join('.'));
}

describe('scanRequiredFields', () => {
	it('derives a root-level required attribute', () => {
		const node = {
			type: 'document',
			name: 'author',
			value: { type: 'object', attributes: { name: { type: 'objectAttribute', value: { type: 'string' } } } },
		};

		expect(scanRequiredFields([node] as never).required).toEqual([
			{ documentType: 'author', segments: ['name'], insideArray: false },
		]);
	});

	it('leaves an optional attribute out', () => {
		const node = {
			type: 'document',
			name: 'author',
			value: {
				type: 'object',
				attributes: { bio: { type: 'objectAttribute', value: { type: 'string' }, optional: true } },
			},
		};

		expect(scanRequiredFields([node] as never).required).toEqual([]);
	});

	it('descends into a nested object', () => {
		const node = {
			type: 'document',
			name: 'author',
			value: {
				type: 'object',
				attributes: {
					nationality: {
						type: 'objectAttribute',
						value: { type: 'object', attributes: { country: { type: 'objectAttribute', value: { type: 'string' } } } },
					},
				},
			},
		};

		expect(scanRequiredFields([node] as never).required.map((field) => field.segments)).toEqual([
			['nationality'],
			['nationality', 'country'],
		]);
	});

	it('marks an attribute inside an array of objects', () => {
		const node = {
			type: 'document',
			name: 'author',
			value: {
				type: 'object',
				attributes: {
					resources: {
						type: 'objectAttribute',
						value: {
							type: 'array',
							of: { type: 'object', attributes: { url: { type: 'objectAttribute', value: { type: 'string' } } } },
						},
					},
				},
			},
		};

		const inside = scanRequiredFields([node] as never).required.find((field) => field.segments.includes('url'));

		expect(inside).toEqual({ documentType: 'author', segments: ['resources', 'url'], insideArray: true });
	});

	it('excludes the system fields the content lake writes', () => {
		const node = {
			type: 'document',
			name: 'author',
			value: {
				type: 'object',
				attributes: {
					_id: { type: 'objectAttribute', value: { type: 'string' } },
					_type: { type: 'objectAttribute', value: { type: 'string' } },
					name: { type: 'objectAttribute', value: { type: 'string' } },
				},
			},
		};

		expect(scanRequiredFields([node] as never).required.map((field) => field.segments)).toEqual([['name']]);
	});

	// Descender a los atributos de una referencia reportaría campos que gobierna el content lake.
	it('does not descend into a reference', () => {
		const node = {
			type: 'document',
			name: 'story',
			value: {
				type: 'object',
				attributes: {
					author: {
						type: 'objectAttribute',
						value: {
							type: 'object',
							dereferencesTo: 'author',
							attributes: { _ref: { type: 'objectAttribute', value: { type: 'string' } } },
						},
					},
				},
			},
		};

		expect(scanRequiredFields([node] as never).required.map((field) => field.segments)).toEqual([['author']]);
	});

	it('reports an array of unions as uncovered instead of skipping it silently', () => {
		const node = {
			type: 'document',
			name: 'storylist',
			value: {
				type: 'object',
				attributes: {
					mediaSources: { type: 'objectAttribute', value: { type: 'array', of: { type: 'union', of: [] } } },
				},
			},
		};

		const { uncovered } = scanRequiredFields([node] as never);

		expect(uncovered).toEqual([
			{ documentType: 'storylist', segments: ['mediaSources'], reason: 'array de tipos unión' },
		]);
	});

	// Los gestiona el content lake: reportarlos sería pedirle a alguien que corrija algo que no carga.
	it('ignores the system document types', () => {
		const node = {
			type: 'document',
			name: 'sanity.fileAsset',
			value: { type: 'object', attributes: { url: { type: 'objectAttribute', value: { type: 'string' } } } },
		};

		expect(scanRequiredFields([node] as never).required).toEqual([]);
	});

	it('ignores entries that are not document types', () => {
		const node = { type: 'type', name: 'slug', value: { type: 'object', attributes: {} } };

		expect(scanRequiredFields([node] as never).required).toEqual([]);
	});

	// Contra el schema real: si el recorrido dejara de descender, estas aserciones caerían aunque los
	// casos sintéticos de arriba siguieran pasando.
	describe('against the committed schema', () => {
		it('finds the required attributes of author', () => {
			expect(pathsOf('author')).toEqual(expect.arrayContaining(['name', 'nationality', 'biography']));
		});

		it('reaches an attribute nested inside an array of objects', () => {
			expect(pathsOf('author')).toEqual(expect.arrayContaining(['resources.url', 'resources.title']));
		});

		it('covers every document type that declares required attributes', () => {
			const scanned = new Set(scanRequiredFields(schema as never).required.map((field) => field.documentType));

			expect([...scanned]).toEqual(expect.arrayContaining(['author', 'story', 'literaryWork', 'tag', 'resourceType']));
		});
	});
});
