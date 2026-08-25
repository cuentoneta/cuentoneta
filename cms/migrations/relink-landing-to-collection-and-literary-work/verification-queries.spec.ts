import { evaluate, parse } from 'groq-js';
import { describe, expect, it } from 'vitest';

import {
	DANGLING_QUERY,
	DRAFTS_IN_FLIGHT_QUERY,
	PARITY_QUERY,
	PER_DOCUMENT_MISMATCH_QUERY,
	UNREVERTIBLE_QUERY,
} from './verification-queries';

const run = async (query: string, dataset: Record<string, unknown>[]) => {
	const result = await evaluate(parse(query), { dataset });
	return result.get();
};

const reference = (key: string, ref: string) => ({ _key: key, _type: 'reference', _ref: ref });

const collection = { _id: 'collection-1', _type: 'collection' };
const literaryWork = { _id: 'lw-1', _type: 'literaryWork' };

const migratedLanding = (overrides: Record<string, unknown> = {}) => ({
	_id: 'landing-1',
	_type: 'landingPage',
	cards: [reference('c1', 'storylist-1')],
	collections: [reference('c1', 'collection-1')],
	latestReads: [reference('l1', 'story-1')],
	latestLiteraryWorks: [reference('l1', 'lw-1')],
	...overrides,
});

describe('consulta de paridad', () => {
	it('reporta el mismo conteo en el campo nuevo que en su origen', async () => {
		expect(await run(PARITY_QUERY, [migratedLanding(), collection, literaryWork])).toMatchObject({
			cards: 1,
			collections: 1,
			latestReads: 1,
			latestWorks: 1,
		});
	});

	// Recorrer un campo ausente no da una lista vacía sino `[null]`, así que sin la guarda un documento
	// sin migrar sumaba uno de más y la paridad daba bien justo cuando no debía.
	it('cuenta cero, y no uno, en el campo que todavía no se pobló', async () => {
		const sinPoblar = { _id: 'landing-1', _type: 'landingPage', cards: [reference('c1', 'storylist-1')] };
		const result = (await run(PARITY_QUERY, [sinPoblar])) as Record<string, number>;

		expect(result.cards).toBe(1);
		expect(result.collections).toBe(0);
	});
});

describe('consulta de referencias colgadas', () => {
	it('no reporta ninguna cuando todos los destinos existen', async () => {
		expect(await run(DANGLING_QUERY, [migratedLanding(), collection, literaryWork])).toMatchObject({
			collections: 0,
			latestWorks: 0,
		});
	});

	// Es el caso que la primera versión de esta consulta no detectaba: contaba los nulos del destino
	// ausente en vez de descartarlos, así que daba el mismo número con y sin referencias rotas.
	it('detecta una referencia cuyo destino no existe', async () => {
		const dataset = [migratedLanding({ collections: [reference('c1', 'collection-inexistente')] }), literaryWork];

		expect(await run(DANGLING_QUERY, dataset)).toMatchObject({ collections: 1, latestWorks: 0 });
	});

	// El otro lado del mismo defecto: sin la guarda, cada documento que todavía no tiene el campo
	// aparecía como una referencia colgada, y la verificación fallaba justo cuando todo estaba bien.
	it('no reporta como colgado un documento que todavía no tiene el campo', async () => {
		const sinMigrar = { _id: 'landing-2', _type: 'landingPage', cards: [reference('c1', 'storylist-1')] };

		expect(await run(DANGLING_QUERY, [migratedLanding(), collection, literaryWork, sinMigrar])).toMatchObject({
			collections: 0,
		});
	});

	it('detecta una referencia colgada en el contenido rotativo', async () => {
		const dataset = [
			{
				_id: 'rotating-content',
				_type: 'rotatingContent',
				mostRead: [reference('m1', 'story-1')],
				mostReadLiteraryWorks: [reference('m1', 'lw-inexistente')],
			},
		];

		expect(await run(DANGLING_QUERY, dataset)).toMatchObject({ mostReadWorks: 1 });
	});
});

describe('consulta de discrepancia por documento', () => {
	it('no nombra a nadie cuando cada documento tiene su paridad', async () => {
		expect(await run(PER_DOCUMENT_MISMATCH_QUERY, [migratedLanding()])).toEqual([]);
	});

	// La paridad agregada suma igual con un documento de más y otro de menos: por eso hace falta ésta.
	it('nombra al documento cuyo campo nuevo tiene menos referencias que su origen', async () => {
		const dataset = [
			migratedLanding({ _id: 'con-faltante', collections: [] }),
			migratedLanding({
				_id: 'con-sobrante',
				collections: [reference('c1', 'collection-1'), reference('c2', 'collection-1')],
			}),
		];

		expect(await run(PER_DOCUMENT_MISMATCH_QUERY, dataset)).toEqual(['con-faltante', 'con-sobrante']);
	});
});

describe('consulta de documentos no revertibles', () => {
	it('no nombra a nadie mientras el origen siga poblado', async () => {
		expect(await run(UNREVERTIBLE_QUERY, [migratedLanding()])).toEqual([]);
	});

	it('nombra al documento cuyo origen ya se retiró', async () => {
		const sinOrigen = {
			_id: 'landing-1',
			_type: 'landingPage',
			collections: [reference('c1', 'collection-1')],
		};

		expect(await run(UNREVERTIBLE_QUERY, [sinOrigen])).toEqual(['landing-1']);
	});
});

describe('consulta de borradores en vuelo', () => {
	it('nombra los borradores de los tipos que la migración toca', async () => {
		const dataset = [
			migratedLanding(),
			{ _id: 'drafts.landing-1', _type: 'landingPage' },
			{ _id: 'drafts.author-1', _type: 'author' },
		];

		expect(await run(DRAFTS_IN_FLIGHT_QUERY, dataset)).toEqual(['drafts.landing-1']);
	});
});
