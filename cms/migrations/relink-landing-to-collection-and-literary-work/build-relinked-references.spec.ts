import { describe, expect, it } from 'vitest';

import {
	buildCollectionReferences,
	buildLiteraryWorkReferences,
	type KeyedReference,
} from './build-relinked-references';

function reference(key: string, ref: string): KeyedReference {
	return { _key: key, _type: 'reference', _ref: ref };
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

	// Es lo que permite re-correr la migración tras el paso del generador de semanas futuras sin que las
	// referencias ya derivadas acumulen el prefijo una vez por corrida.
	it('deja intacta una referencia ya derivada', () => {
		const alreadyDerived = reference('a', 'collection-from-storylist-storylist-verano');

		expect(buildCollectionReferences([alreadyDerived])).toEqual([alreadyDerived]);
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

	it('deja intacta una referencia ya derivada', () => {
		const alreadyDerived = reference('a', 'lw-from-story-story-el-aleph');

		expect(buildLiteraryWorkReferences([alreadyDerived])).toEqual([alreadyDerived]);
	});
});
