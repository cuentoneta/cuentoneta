import { evaluate, parse } from 'groq-js';
import { describe, expect, it } from 'vitest';

import { UncorrectableLiteraryWorkError } from './apply-corrections';
import migration from './index';

interface LiteraryWorkDocument {
	_id: string;
	content?: { _key?: string; body?: unknown }[];
}

interface BodyPatch {
	op: { type: string; value: string };
	path: (string | { _key: string })[];
}

// `defineMigration` conserva el objeto tal cual, así que `migrate.document` es una función pura y es
// lo único que hace falta ejercitar: decide qué patches emite cada obra.
const migrateDocument = (doc: LiteraryWorkDocument) => {
	const document = migration.migrate?.document;
	if (!document) throw new Error('La migración no define migrate.document');
	return document(doc as never) as unknown as BodyPatch[];
};

const LIGA_ID = 'lw-from-story-bd3bbc87-71bd-4374-9cf8-417e915669c7';
const CARTA_ID = 'lw-from-story-e1138575-5c25-41c4-9bd2-4793642ceb62';
const AMOR_ID = 'lw-from-story-666dac9b-9086-4db9-a17c-d38f6f09532c';
const SOMBRAS_ID = 'lw-from-story-187a0eab-11ce-4b91-96c2-b2403d35cc05';

const work = (id: string, body: string): LiteraryWorkDocument => ({
	_id: id,
	content: [{ _key: 'section-0', body }],
});

const bodyOf = (patches: BodyPatch[]) => patches[0].op.value;

// Los cuerpos reproducen la FORMA relevada —marco, ancla, separadores de escena vecinos— con prosa de
// relleno. No se copia el texto de las obras: ataría el spec a un texto que esta migración modifica.
const ligaBody = [
	'Primera escena.',
	'',
	'---',
	'',
	'Tomé el periódico de sus manos y leí:',
	'',
	'---',
	'',
	'**A LA LIGA DE LOS PELIRROJOS**',
	'',
	'El cuerpo del primer aviso.',
	'',
	'---',
	'',
	'En ella se leía esto:',
	'',
	'---',
	'',
	'**LA LIGA DE LOS PELIRROJOS HA SIDO DISUELTA**',
	'',
	'**9 de octubre de 1890**',
	'',
	'---',
	'',
	'Examinamos el anuncio.',
	'',
	'---',
	'',
	'Última escena.',
].join('\n');

const cartaBody = 'Cuerpo de la carta.\n\nUn beso de tu\n\nJosé';
const amorBody = '**Parte I**\n\nPrimera parte.\n\n**Parte final**Abrí los ojos.\n\nSigue el desenlace.';

describe('migración de los pasajes centrados a Markdown semántico', () => {
	it('alcanza solo a las obras', () => {
		expect(migration.documentTypes).toEqual(['literaryWork']);
	});

	// El filtro se ejecuta con el mismo motor que GROQ, no se compara como texto: una aserción textual
	// pasa igual con un filtro roto mientras el literal coincida.
	describe('el filtro decide qué entra', () => {
		const matching = async (...docs: Record<string, unknown>[]) => {
			const result = await evaluate(parse(`*[${migration.filter}]._id`), { dataset: docs });
			return (await result.get()) as string[];
		};

		it('admite las tres obras a corregir y sus borradores', async () => {
			const ids = await matching(
				{ _id: LIGA_ID },
				{ _id: CARTA_ID },
				{ _id: AMOR_ID },
				{ _id: `drafts.${LIGA_ID}` },
				{ _id: `drafts.${CARTA_ID}` },
				{ _id: `drafts.${AMOR_ID}` },
			);

			expect(ids).toHaveLength(6);
		});

		it('deja fuera la obra que se decidió no tocar y cualquier otra', async () => {
			const ids = await matching({ _id: SOMBRAS_ID }, { _id: `drafts.${SOMBRAS_ID}` }, { _id: 'lw-cualquiera' });

			expect(ids).toEqual([]);
		});
	});

	it('no muta una obra fuera de la tabla', () => {
		expect(migrateDocument(work('lw-cualquiera', 'Prosa.'))).toEqual([]);
	});

	// El patch se ancla por `_key` y no por índice: un índice se corre si alguien reordena las secciones
	// entre el dry-run y la corrida real.
	it('ancla el patch en la _key de la sección', () => {
		const [patch] = migrateDocument(work(CARTA_ID, cartaBody));

		expect(patch.path).toEqual(['content', { _key: 'section-0' }, 'body']);
	});

	it('cita los dos avisos y deja intactos los separadores de escena', () => {
		const corrected = bodyOf(migrateDocument(work(LIGA_ID, ligaBody)));

		expect(corrected).toContain('> **A LA LIGA DE LOS PELIRROJOS**');
		expect(corrected).toContain('> **LA LIGA DE LOS PELIRROJOS HA SIDO DISUELTA**');
		expect(corrected).toContain('>\n> **9 de octubre de 1890**');
		expect(corrected.startsWith('Primera escena.\n\n---\n\n')).toBe(true);
		expect(corrected.endsWith('\n\n---\n\nÚltima escena.')).toBe(true);
	});

	it('pone la firma en énfasis al cierre de la carta', () => {
		const corrected = bodyOf(migrateDocument(work(CARTA_ID, cartaBody)));

		expect(corrected.endsWith('Un beso de tu\n\n*José*')).toBe(true);
	});

	it('separa el encabezado de parte del texto que lo sigue, sin tocar los anteriores', () => {
		const corrected = bodyOf(migrateDocument(work(AMOR_ID, amorBody)));

		expect(corrected).toContain('**Parte final**\n\nAbrí los ojos.');
		expect(corrected).toContain('**Parte I**\n\nPrimera parte.');
	});

	it('corrige el borrador igual que su publicado', () => {
		const corrected = bodyOf(migrateDocument(work(`drafts.${CARTA_ID}`, cartaBody)));

		expect(corrected.endsWith('*José*')).toBe(true);
	});

	// La idempotencia es observable en el contador de la CLI porque la migración emite patches: una
	// segunda corrida sobre el resultado no emite ninguna mutación.
	it('no emite mutación alguna sobre una obra ya corregida', () => {
		const corrected = bodyOf(migrateDocument(work(LIGA_ID, ligaBody)));

		expect(migrateDocument(work(LIGA_ID, corrected))).toEqual([]);
	});

	it('aborta cuando el pasaje ya no está en el documento', () => {
		expect(() => migrateDocument(work(CARTA_ID, 'Una carta que alguien reescribió.'))).toThrow(
			UncorrectableLiteraryWorkError,
		);
	});

	it('aborta cuando una sección no tiene _key, porque el patch no podría anclarse', () => {
		expect(() => migrateDocument({ _id: CARTA_ID, content: [{ body: cartaBody }] })).toThrow(
			UncorrectableLiteraryWorkError,
		);
	});
});
