import { createSlug } from '@models/slug.model';
import type { LiteraryWorkTeaser } from '@models/literary-work.model';
import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
import { rankSuggestedLiteraryWorks } from './literary-work-suggestions';

// Las fixtures descomponen una obra del canon cambiándole lo único que el criterio mira —slug y
// tags—, en vez de inventar una obra de prueba: el resto de los campos sigue siendo el que el corpus
// ya validó.
const [canon] = onoffLiteraryWorkTeasersMock;

function fixture(slug: string, tagSlugs: readonly string[]): LiteraryWorkTeaser {
	return {
		...canon,
		slug: createSlug(slug),
		tags: tagSlugs.map((tagSlug) => ({ title: tagSlug, slug: tagSlug, description: tagSlug })),
	};
}

function slugsOf(literaryWorks: readonly LiteraryWorkTeaser[]): string[] {
	return literaryWorks.map(({ slug }) => slug);
}

// El orden dentro de un empate de afinidad rota, así que lo que se afirma de él es el ciclo: el mismo
// listado, empezando en otro punto. Un reordenamiento libre —ordenar por otro criterio, o barajar— no
// lo cumpliría.
function isRotationOf(listing: readonly string[], candidate: readonly string[]): boolean {
	return listing.some(
		(_, offset) => [...listing.slice(offset), ...listing.slice(0, offset)].join() === candidate.join(),
	);
}

describe('rankSuggestedLiteraryWorks', () => {
	it('leaves the work being read out of the suggestions', () => {
		const reference = fixture('referencia', ['ensayo']);

		expect(slugsOf(rankSuggestedLiteraryWorks([reference, fixture('otra', ['ensayo'])], 'referencia', 3))).toEqual([
			'otra',
		]);
	});

	it('ranks the works sharing more tags first', () => {
		const reference = fixture('referencia', ['ensayo', 'teatro']);
		const oneShared = fixture('un-tag', ['ensayo']);
		const twoShared = fixture('dos-tags', ['ensayo', 'teatro']);

		expect(slugsOf(rankSuggestedLiteraryWorks([oneShared, reference, twoShared], 'referencia', 3))).toEqual([
			'dos-tags',
			'un-tag',
		]);
	});

	it('caps the result at the requested limit', () => {
		const reference = fixture('referencia', ['ensayo']);
		const candidates = [reference, fixture('una', []), fixture('otra', []), fixture('tercera', [])];

		expect(rankSuggestedLiteraryWorks(candidates, 'referencia', 2)).toHaveLength(2);
	});

	it('returns fewer suggestions than the limit when the listing runs out', () => {
		const reference = fixture('referencia', ['ensayo']);

		expect(rankSuggestedLiteraryWorks([reference, fixture('unica', ['ensayo'])], 'referencia', 5)).toHaveLength(1);
	});

	it('suggests nothing when the listing only has the work being read', () => {
		const reference = fixture('referencia', ['ensayo']);

		expect(rankSuggestedLiteraryWorks([reference], 'referencia', 3)).toEqual([]);
	});

	// Un tag repetido en el documento de una obra cuenta una vez: sin el dedupe, esa obra ganaría
	// afinidad por una duplicación de curaduría.
	it('counts a repeated tag once', () => {
		const reference = fixture('referencia', ['ensayo', 'teatro']);
		const once = fixture('una-vez', ['ensayo', 'teatro']);
		const twice = fixture('dos-veces', ['ensayo', 'ensayo']);

		expect(slugsOf(rankSuggestedLiteraryWorks([reference, twice, once], 'referencia', 3))).toEqual([
			'una-vez',
			'dos-veces',
		]);
	});

	it('leaves the order of the candidates untouched', () => {
		const reference = fixture('referencia', ['ensayo']);
		const candidates = [fixture('una', []), reference, fixture('otra', ['ensayo'])];
		const before = [...candidates];

		rankSuggestedLiteraryWorks(candidates, 'referencia', 2);

		expect(candidates).toEqual(before);
	});

	// A igual afinidad el orden rota: un ámbito prolífico cuyas obras comparten los mismos tags no ofrece
	// siempre las mismas. Cada obra que se lee arranca el empate en su propio punto.
	it('rotates the tie by the work being read', () => {
		const candidates = [fixture('una', []), fixture('otra', []), fixture('tercera', [])];

		const fromElOdio = slugsOf(rankSuggestedLiteraryWorks(candidates, 'el-odio', 3));
		const fromGeometria = slugsOf(rankSuggestedLiteraryWorks(candidates, 'geometria', 3));

		expect(isRotationOf(['una', 'otra', 'tercera'], fromElOdio)).toBe(true);
		expect(isRotationOf(['una', 'otra', 'tercera'], fromGeometria)).toBe(true);
		expect(fromElOdio).not.toEqual(fromGeometria);
	});

	it('keeps the same rotation for every request of the same work', () => {
		const candidates = [fixture('referencia', []), fixture('una', []), fixture('otra', []), fixture('tercera', [])];

		expect(rankSuggestedLiteraryWorks(candidates, 'referencia', 3)).toEqual(
			rankSuggestedLiteraryWorks(candidates, 'referencia', 3),
		);
	});

	// Un contexto de navegación viejo —o de otro ámbito— deja la obra que se lee fuera del listado: no hay
	// afinidad que medir ni nada que descartar, así que todas empatan y la rotación es la que reparte.
	it('rotates the whole listing when the work being read is not among the candidates', () => {
		const candidates = [fixture('primera', ['ensayo']), fixture('segunda', ['ensayo']), fixture('tercera', ['ensayo'])];

		const suggestions = slugsOf(rankSuggestedLiteraryWorks(candidates, 'no-esta', 3));

		expect(isRotationOf(['primera', 'segunda', 'tercera'], suggestions)).toBe(true);
	});

	// El canon: las dos obras que comparten dos tags con la que se lee van primero —en el orden que la
	// rotación decida— y la tercera sale del empate de un solo tag compartido.
	it('ranks the corpus by the tags it shares with the work being read', () => {
		const [reference] = onoffLiteraryWorkTeasersMock;

		const suggestions = slugsOf(rankSuggestedLiteraryWorks(onoffLiteraryWorkTeasersMock, reference.slug, 3));

		expect(new Set(suggestions.slice(0, 2))).toEqual(new Set(['el-odio', 'las-dos-antorchas']));
		expect(['geometria', 'las-escaleras', 'el-tratado-de-los-placeres']).toContain(suggestions[2]);
	});
});
