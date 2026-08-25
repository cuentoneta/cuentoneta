import { describe, expect, it } from 'vitest';

import {
	buildCollectionReferences,
	buildLiteraryWorkReferences,
	type KeyedReference,
} from './build-relinked-references';

function reference(key: string, ref: string, extra: Partial<KeyedReference> = {}): KeyedReference {
	return { _key: key, _type: 'reference', _ref: ref, ...extra };
}

describe('buildCollectionReferences', () => {
	it('apunta al documento de colección derivado de la storylist', () => {
		expect(buildCollectionReferences([reference('a', 'storylist-verano')])).toEqual([
			reference('a', 'collection-from-storylist-storylist-verano'),
		]);
	});

	it('deriva el borrador conservando el prefijo de path al frente', () => {
		const [derived] = buildCollectionReferences([reference('a', 'drafts.storylist-verano')]);

		expect(derived._ref).toBe('drafts.collection-from-storylist-storylist-verano');
	});

	it('devuelve una lista vacía cuando la fuente está ausente', () => {
		expect(buildCollectionReferences(undefined)).toEqual([]);
	});

	it('conserva la clave y el orden de la fuente', () => {
		const derived = buildCollectionReferences([reference('b', 'storylist-uno'), reference('a', 'storylist-dos')]);

		expect(derived.map(({ _key }) => _key)).toEqual(['b', 'a']);
	});

	// Una referencia débil dice que el destino todavía no está publicado. Sintetizarla taparía un dataset
	// a medio migrar; perderla haría que el content lake rechace la transacción entera.
	it('copia la debilidad del origen', () => {
		const [derived] = buildCollectionReferences([reference('a', 'storylist-verano', { _weak: true })]);

		expect(derived._weak).toBe(true);
	});

	it('no inventa debilidad donde el origen no la declara', () => {
		const [derived] = buildCollectionReferences([reference('a', 'storylist-verano')]);

		expect('_weak' in derived).toBe(false);
	});

	// Es lo que distingue este reapuntado de una copia: el tipo del destino cambia, así que la promesa de
	// fortalecer al publicar tiene que nombrar el tipo nuevo y no el viejo.
	it('retraduce al tipo destino la promesa de fortalecer al publicar', () => {
		const [derived] = buildCollectionReferences([
			reference('a', 'storylist-verano', {
				_strengthenOnPublish: { type: 'storylist', template: { id: 'storylist' } },
			}),
		]);

		expect(derived._strengthenOnPublish).toEqual({ type: 'collection', template: { id: 'collection' } });
	});

	it('no inventa la promesa donde el origen no la declara', () => {
		const [derived] = buildCollectionReferences([reference('a', 'storylist-verano')]);

		expect('_strengthenOnPublish' in derived).toBe(false);
	});
});

describe('buildLiteraryWorkReferences', () => {
	it('apunta a la obra derivada de la historia', () => {
		expect(buildLiteraryWorkReferences([reference('a', 'story-el-aleph')])).toEqual([
			reference('a', 'lw-from-story-story-el-aleph'),
		]);
	});

	it('deriva el borrador conservando el prefijo de path al frente', () => {
		const [derived] = buildLiteraryWorkReferences([reference('a', 'drafts.story-el-aleph')]);

		expect(derived._ref).toBe('drafts.lw-from-story-story-el-aleph');
	});

	it('devuelve una lista vacía cuando la fuente está vacía', () => {
		expect(buildLiteraryWorkReferences([])).toEqual([]);
	});

	it('retraduce al tipo destino la promesa de fortalecer al publicar', () => {
		const [derived] = buildLiteraryWorkReferences([
			reference('a', 'story-el-aleph', { _strengthenOnPublish: { type: 'story', template: { id: 'story' } } }),
		]);

		expect(derived._strengthenOnPublish).toEqual({ type: 'literaryWork', template: { id: 'literaryWork' } });
	});

	it('copia la debilidad del origen', () => {
		const [derived] = buildLiteraryWorkReferences([reference('a', 'story-el-aleph', { _weak: true })]);

		expect(derived._weak).toBe(true);
	});
});
