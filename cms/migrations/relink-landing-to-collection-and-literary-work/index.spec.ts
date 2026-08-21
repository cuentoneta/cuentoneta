import { evaluate, parse } from 'groq-js';
import { describe, expect, it } from 'vitest';

import type { KeyedReference } from './build-relinked-references';
import migration from './index';

// `defineMigration` conserva el objeto tal cual, así que `migrate.document` es una función pura y es lo
// único que hace falta ejercitar: decide qué mutación emite cada documento.
interface FieldPatch {
	path: string[];
	op: { type: string; value?: unknown };
}

const migrateDocument = (doc: Record<string, unknown>) => {
	const document = migration.migrate?.document;
	if (!document) throw new Error('La migración no define migrate.document');
	return document(doc as never) as FieldPatch[];
};

const reference = (key: string, ref: string): KeyedReference => ({ _key: key, _type: 'reference', _ref: ref });

const landingPage = (overrides: Record<string, unknown> = {}) => ({
	_id: 'landing-2026-01',
	_type: 'landingPage',
	cards: [reference('c1', 'storylist-verano')],
	latestReads: [reference('l1', 'story-el-aleph')],
	...overrides,
});

const rotatingContent = (overrides: Record<string, unknown> = {}) => ({
	_id: 'rotating-content',
	_type: 'rotatingContent',
	mostRead: [reference('m1', 'story-el-aleph')],
	...overrides,
});

const patchFor = (patches: FieldPatch[], field: string) => patches.find(({ path }) => path[0] === field);

/** Los destinos escritos sobre un campo, o `undefined` si el campo no se tocó. */
const writtenRefs = (patches: FieldPatch[], field: string): string[] | undefined =>
	(patchFor(patches, field)?.op.value as KeyedReference[] | undefined)?.map(({ _ref }) => _ref);

describe('migración de reapuntado de la página de inicio y el contenido rotativo', () => {
	it('alcanza a los dos tipos de documento que llevan las referencias', () => {
		expect(migration.documentTypes).toEqual(['landingPage', 'rotatingContent']);
	});

	// El filtro se ejecuta con el mismo motor que GROQ y no se compara como texto: una aserción textual
	// pasa igual con un filtro roto mientras el literal coincida.
	describe('el filtro decide qué entra', () => {
		const matching = async (...docs: Record<string, unknown>[]) => {
			const result = await evaluate(parse(`*[${migration.filter}]._id`), { dataset: docs });
			return (await result.get()) as string[];
		};

		it('admite un documento publicado', async () => {
			expect(await matching({ _id: 'publicado', _type: 'landingPage' })).toEqual(['publicado']);
		});

		it('deja fuera un borrador', async () => {
			expect(await matching({ _id: 'drafts.borrador', _type: 'landingPage' })).toEqual([]);
		});
	});

	describe('página de inicio', () => {
		it('puebla los dos campos nuevos desde los viejos', () => {
			const mutations = migrateDocument(landingPage());

			expect(writtenRefs(mutations, 'collections')).toEqual(['collection-from-storylist-storylist-verano']);
			expect(writtenRefs(mutations, 'latestLiteraryWorks')).toEqual(['lw-from-story-story-el-aleph']);
		});

		// Escribir una lista vacía marcaría el documento como migrado sin haberlo estado.
		it('no emite mutación cuando las dos fuentes están vacías', () => {
			expect(migrateDocument(landingPage({ cards: [], latestReads: undefined }))).toEqual([]);
		});

		it('puebla solo el campo cuya fuente tiene contenido', () => {
			const mutations = migrateDocument(landingPage({ latestReads: [] }));

			expect(mutations).toHaveLength(1);
			expect(writtenRefs(mutations, 'collections')).toBeDefined();
		});

		// Es lo que hace segura la re-corrida posterior al despliegue del contrato nuevo: una edición hecha
		// a mano en el Studio sobre el campo nuevo no se pisa con lo derivado del viejo.
		it('escribe con semántica de backfill y no de sincronización', () => {
			const [patch] = migrateDocument(landingPage());

			expect(patch.op.type).toBe('setIfMissing');
		});

		it('conserva la clave de la referencia de origen', () => {
			const written = (patchFor(migrateDocument(landingPage()), 'collections')?.op.value ?? []) as KeyedReference[];

			expect(written[0]?._key).toBe('c1');
		});
	});

	describe('contenido rotativo', () => {
		it('puebla las obras más leídas desde las historias', () => {
			expect(writtenRefs(migrateDocument(rotatingContent()), 'mostReadLiteraryWorks')).toEqual([
				'lw-from-story-story-el-aleph',
			]);
		});

		it('no toca los campos de la página de inicio', () => {
			const mutations = migrateDocument(rotatingContent());

			expect(mutations).toHaveLength(1);
		});

		it('no emite mutación cuando la fuente está vacía', () => {
			expect(migrateDocument(rotatingContent({ mostRead: [] }))).toEqual([]);
		});
	});
});
