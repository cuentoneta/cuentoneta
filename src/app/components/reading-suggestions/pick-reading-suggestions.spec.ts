import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
import { clearAllMocks, spyOn } from '@test-utils';
import { pickReadingSuggestions, READING_SUGGESTIONS_COUNT } from './pick-reading-suggestions';

const candidates = onoffLiteraryWorkTeasersMock;

// Fija el azar desde su fuente, como el resto de los specs de la carpeta, en vez de inyectarlo por
// parámetro: la firma de producción no tiene por qué exponer un punto de extensión que solo usa el test.
function stubRandom(value: number): void {
	spyOn(Math, 'random').mockReturnValue(value);
}

afterEach(() => clearAllMocks());

describe('pickReadingSuggestions', () => {
	it('should pick as many suggestions as the block renders', () => {
		expect(pickReadingSuggestions(candidates)).toHaveLength(READING_SUGGESTIONS_COUNT);
	});

	it('should exclude the work being read', () => {
		const [current] = candidates;

		const suggestions = pickReadingSuggestions(candidates, current.slug);

		expect(suggestions.map((suggestion) => suggestion.slug)).not.toContain(current.slug);
	});

	it('should return every candidate when there are fewer than the block renders', () => {
		const pool = candidates.slice(0, 2);

		expect(pickReadingSuggestions(pool)).toHaveLength(2);
	});

	it('should return nothing when the only candidate is the work being read', () => {
		const [current] = candidates;

		expect(pickReadingSuggestions([current], current.slug)).toEqual([]);
	});

	it('should not repeat a suggestion', () => {
		const suggestions = pickReadingSuggestions(candidates);

		expect(new Set(suggestions.map((suggestion) => suggestion.slug)).size).toBe(suggestions.length);
	});

	it('should draw from the candidates in the order the random source dictates', () => {
		stubRandom(0);

		expect(pickReadingSuggestions(candidates)).toEqual(candidates.slice(0, READING_SUGGESTIONS_COUNT));
	});

	it('should reach the last candidate when the random source points at it', () => {
		stubRandom(0.999999);

		const [first] = pickReadingSuggestions(candidates);

		expect(first).toBe(candidates[candidates.length - 1]);
	});

	it('should leave the source collection untouched', () => {
		const snapshot = [...candidates];

		pickReadingSuggestions(candidates);

		expect(candidates).toEqual(snapshot);
	});
});
