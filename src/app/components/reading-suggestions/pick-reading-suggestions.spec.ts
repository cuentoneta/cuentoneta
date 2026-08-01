import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
import { pickReadingSuggestions, READING_SUGGESTIONS_COUNT } from './pick-reading-suggestions';

const candidates = onoffLiteraryWorkTeasersMock;

// Azar determinista: siempre elige el primer candidato disponible, así el orden de salida es el de
// entrada y las aserciones no dependen de Math.random.
const firstAvailable = () => 0;

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
		const suggestions = pickReadingSuggestions(candidates, undefined, READING_SUGGESTIONS_COUNT, firstAvailable);

		expect(suggestions).toEqual(candidates.slice(0, READING_SUGGESTIONS_COUNT));
	});

	it('should reach the last candidate when the random source points at it', () => {
		const almostOne = () => 0.999999;

		const [first] = pickReadingSuggestions(candidates, undefined, READING_SUGGESTIONS_COUNT, almostOne);

		expect(first).toBe(candidates[candidates.length - 1]);
	});

	it('should leave the source collection untouched', () => {
		const snapshot = [...candidates];

		pickReadingSuggestions(candidates);

		expect(candidates).toEqual(snapshot);
	});
});
