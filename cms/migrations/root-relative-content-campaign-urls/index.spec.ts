import { evaluate, parse } from 'groq-js';
import { describe, expect, it } from 'vitest';

import migration, { toRootRelativeUrl } from './index';

const migrateDocument = (doc: Record<string, unknown>) => {
	const document = migration.migrate?.document;
	if (!document) throw new Error('La migración no define migrate.document');
	return document(doc as never) as { path: string[]; op: { type: string; value?: unknown } }[];
};

const campaign = (url: unknown) => ({ _id: 'campaign-1', _type: 'contentCampaign', url });

describe('root-relative-content-campaign-urls', () => {
	// El filtro se ejecuta con el mismo motor que GROQ y no se compara como texto: una aserción textual
	// pasa igual con un filtro roto mientras el literal coincida.
	describe('el filtro decide qué entra', () => {
		const matching = async (...docs: Record<string, unknown>[]) => {
			const result = await evaluate(parse(`*[${migration.filter}]._id`), { dataset: docs });
			return (await result.get()) as string[];
		};

		it('admite una URL relativa, también en un borrador', async () => {
			const docs = [
				{ ...campaign('../collection/x'), _id: 'relativa' },
				{ ...campaign('collection/x'), _id: 'drafts.relativa' },
			];

			expect(await matching(...docs)).toEqual(['relativa', 'drafts.relativa']);
		});

		it('deja fuera una URL que ya empieza en la raíz y una campaña sin URL', async () => {
			expect(
				await matching({ ...campaign('/collection/x'), _id: 'raiz' }, { ...campaign(undefined), _id: 'sin' }),
			).toEqual([]);
		});
	});

	it.each([
		['../collection/autopista-al-espacio', '/collection/autopista-al-espacio'],
		['../../collection/x', '/collection/x'],
		['./collection/x', '/collection/x'],
		['collection/x', '/collection/x'],
		['../literary-work/el-fin?utm_source=campania', '/literary-work/el-fin?utm_source=campania'],
	])('reescribe %j como %j', (url, expected) => {
		expect(migrateDocument(campaign(url))).toEqual([
			expect.objectContaining({ path: ['url'], op: expect.objectContaining({ type: 'set', value: expected }) }),
		]);
	});

	// Una segunda corrida encuentra la forma ya reescrita y no emite nada.
	it('es idempotente', () => {
		const [patch] = migrateDocument(campaign('../collection/x'));

		expect(migrateDocument(campaign(patch.op.value))).toEqual([]);
	});

	it.each(['https://www.cuentoneta.ar/collection/x', 'mailto:contacto@cuentoneta.ar'])(
		'no toca una URL con esquema (%j), que no es una ruta del sitio',
		(url) => {
			expect(toRootRelativeUrl(url)).toBeUndefined();
			expect(migrateDocument(campaign(url))).toEqual([]);
		},
	);

	it('no toca una campaña cuya URL no es un string', () => {
		expect(migrateDocument(campaign(undefined))).toEqual([]);
		expect(migrateDocument(campaign(42))).toEqual([]);
	});
});
