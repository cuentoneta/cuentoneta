import { createCollectionTeaser, type CollectionTeaser } from '@models/collection.model';
import { onoffCollectionTeasersMock } from '@mocks/onoff-collections.mock';
import { rankSuggestedCollections } from './collection-suggestions';

// Las fixtures descomponen una colección del canon cambiándole lo único que el criterio mira —slug,
// tags y cantidad—, en vez de inventar una colección de prueba: el resto de los campos sigue siendo
// el que la factory del teaser validó.
const [canon] = onoffCollectionTeasersMock;

function fixture(slug: string, tagSlugs: readonly string[], count: number): CollectionTeaser {
	return createCollectionTeaser({
		...canon,
		_id: `fixture-${slug}`,
		slug,
		tags: tagSlugs.map((tagSlug) => ({ title: tagSlug, slug: tagSlug, description: tagSlug })),
		count,
	});
}

function slugsOf(collections: readonly CollectionTeaser[]): string[] {
	return collections.map(({ slug }) => slug);
}

describe('rankSuggestedCollections', () => {
	it('leaves the reference collection out of the suggestions', () => {
		const target = fixture('referencia', ['ensayo'], 3);

		expect(slugsOf(rankSuggestedCollections(target, [target, fixture('otra', ['ensayo'], 3)], 5))).toEqual(['otra']);
	});

	it('ranks the collections sharing more tags first', () => {
		const target = fixture('referencia', ['ensayo', 'teatro'], 3);
		const oneShared = fixture('un-tag', ['ensayo'], 3);
		const twoShared = fixture('dos-tags', ['ensayo', 'teatro'], 3);

		expect(slugsOf(rankSuggestedCollections(target, [oneShared, twoShared], 5))).toEqual(['dos-tags', 'un-tag']);
	});

	it('breaks a tie in shared tags by how close the size is', () => {
		const target = fixture('referencia', ['ensayo'], 10);
		const far = fixture('lejana', ['ensayo'], 40);
		const near = fixture('cercana', ['ensayo'], 12);

		expect(slugsOf(rankSuggestedCollections(target, [far, near], 5))).toEqual(['cercana', 'lejana']);
	});

	it('keeps the catalog order when shared tags and size tie', () => {
		const target = fixture('referencia', ['ensayo'], 3);
		const first = fixture('primera', ['ensayo'], 4);
		const second = fixture('segunda', ['ensayo'], 4);

		expect(slugsOf(rankSuggestedCollections(target, [first, second], 5))).toEqual(['primera', 'segunda']);
		expect(slugsOf(rankSuggestedCollections(target, [second, first], 5))).toEqual(['segunda', 'primera']);
	});

	// Una colección sin tags en común no deja de ser candidata: completa la lista en vez de desaparecer.
	it('fills the list with collections that share no tags', () => {
		const target = fixture('referencia', ['ensayo'], 3);
		const shared = fixture('comparte', ['ensayo'], 3);
		const unrelated = fixture('sin-tags', [], 3);

		expect(slugsOf(rankSuggestedCollections(target, [unrelated, shared], 2))).toEqual(['comparte', 'sin-tags']);
	});

	it('caps the result at the requested limit', () => {
		const target = fixture('referencia', ['ensayo'], 3);
		const candidates = [fixture('una', [], 3), fixture('otra', [], 3), fixture('tercera', [], 3)];

		expect(rankSuggestedCollections(target, candidates, 2)).toHaveLength(2);
	});

	it('returns fewer suggestions than the limit when the catalog runs out', () => {
		const target = fixture('referencia', ['ensayo'], 3);

		expect(rankSuggestedCollections(target, [target, fixture('unica', ['ensayo'], 3)], 5)).toHaveLength(1);
	});

	it('suggests nothing when the catalog only has the reference', () => {
		const target = fixture('referencia', ['ensayo'], 3);

		expect(rankSuggestedCollections(target, [target], 5)).toEqual([]);
	});

	// Un tag repetido en el documento de una colección cuenta una vez: sin el dedupe, esa colección
	// ganaría relevancia por una duplicación de curaduría.
	it('counts a repeated tag once', () => {
		const target = fixture('referencia', ['ensayo'], 3);
		const once = fixture('una-vez', ['ensayo'], 3);
		const twice = fixture('dos-veces', ['ensayo', 'ensayo'], 3);

		expect(slugsOf(rankSuggestedCollections(target, [once, twice], 2))).toEqual(['una-vez', 'dos-veces']);
	});

	it('leaves the order of the candidates untouched', () => {
		const target = fixture('referencia', ['ensayo'], 3);
		const candidates = [fixture('una', [], 3), fixture('otra', ['ensayo'], 3)];
		const before = [...candidates];

		rankSuggestedCollections(target, candidates, 2);

		expect(candidates).toEqual(before);
	});

	// El canon: las dos colecciones que comparten `colaborativa` con la referencia van primero, y las
	// que no comparten ningún tag conservan el orden del catálogo.
	it('ranks the corpus by the tags it shares with the reference', () => {
		const [reference] = onoffCollectionTeasersMock;
		const suggestions = rankSuggestedCollections(reference, onoffCollectionTeasersMock, 3);

		expect(slugsOf(suggestions)).toEqual(['inventario-de-las-pasiones', 'cuadernos-del-meridien', 'ambar-y-ceniza']);
	});
});
