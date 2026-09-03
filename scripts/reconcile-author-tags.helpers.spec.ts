import {
	collectDerivedTags,
	planAuthorTagPatches,
	type AuthorTagProjection,
	type LiteraryWorkTagProjection,
} from './reconcile-author-tags.helpers';

function work(authorRefs: string[], tagRefs: string[]): LiteraryWorkTagProjection {
	return { authorRefs, tagRefs };
}

function author(id: string, tags: Array<{ _key: string; _ref: string }>): AuthorTagProjection {
	return { _id: id, tags };
}

describe('collectDerivedTags', () => {
	it('agrupa por autor los tags de sus obras', () => {
		const derived = collectDerivedTags([work(['author-1'], ['tag-a', 'tag-b']), work(['author-2'], ['tag-c'])]);

		expect([...(derived.get('author-1') ?? [])].sort()).toEqual(['tag-a', 'tag-b']);
		expect([...(derived.get('author-2') ?? [])]).toEqual(['tag-c']);
	});

	it('reparte los tags de una obra entre todos sus autores', () => {
		const derived = collectDerivedTags([work(['author-1', 'author-2'], ['tag-a'])]);

		expect([...(derived.get('author-1') ?? [])]).toEqual(['tag-a']);
		expect([...(derived.get('author-2') ?? [])]).toEqual(['tag-a']);
	});

	it('une los tags de varias obras del mismo autor sin duplicar', () => {
		const derived = collectDerivedTags([
			work(['author-1'], ['tag-a', 'tag-b']),
			work(['author-1'], ['tag-b', 'tag-c']),
		]);

		expect([...(derived.get('author-1') ?? [])].sort()).toEqual(['tag-a', 'tag-b', 'tag-c']);
	});

	it('ignora las obras sin tags o sin autores', () => {
		const derived = collectDerivedTags([work(['author-1'], []), work([], ['tag-a'])]);

		expect(derived.size).toBe(0);
	});
});

describe('planAuthorTagPatches', () => {
	it('conserva las claves existentes y acuña solo las faltantes', () => {
		const plans = planAuthorTagPatches(
			[author('author-1', [{ _key: 'key-a', _ref: 'tag-a' }])],
			new Map([['author-1', new Set(['tag-a', 'tag-b'])]]),
		);

		expect(plans).toEqual([
			{
				authorId: 'author-1',
				kept: [{ _key: 'key-a', _ref: 'tag-a' }],
				missing: ['tag-b'],
			},
		]);
	});

	it('omite al autor que ya tiene todos los derivados', () => {
		const plans = planAuthorTagPatches(
			[author('author-1', [{ _key: 'key-a', _ref: 'tag-a' }])],
			new Map([['author-1', new Set(['tag-a'])]]),
		);

		expect(plans).toEqual([]);
	});

	it('conserva los manuales que ninguna obra deriva', () => {
		const plans = planAuthorTagPatches(
			[author('author-1', [{ _key: 'key-manual', _ref: 'tag-manual' }])],
			new Map([['author-1', new Set(['tag-a'])]]),
		);

		expect(plans[0].kept).toEqual([{ _key: 'key-manual', _ref: 'tag-manual' }]);
		expect(plans[0].missing).toEqual(['tag-a']);
	});

	it('ignora los tags derivados de autores fuera del catálogo', () => {
		const plans = planAuthorTagPatches(
			[author('author-1', [])],
			new Map([
				['author-1', new Set(['tag-a'])],
				['author-gone', new Set(['tag-b'])],
			]),
		);

		expect(plans.map((plan) => plan.authorId)).toEqual(['author-1']);
	});

	it('devuelve vacío sin autores ni derivados', () => {
		expect(planAuthorTagPatches([], new Map())).toEqual([]);
	});
});
