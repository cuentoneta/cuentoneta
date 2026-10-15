import { onoffLiteraryWorkTeasersMock } from './onoff-literary-work-teasers.mock';
import { onoffCollectionsMock } from './onoff-collections.mock';
import { onoffReadingSuggestionsMock } from './onoff-reading-suggestions.mock';

const [work] = onoffLiteraryWorkTeasersMock;
const [authorOfWork] = work.authors;
const [collection] = onoffCollectionsMock;

describe('onoffReadingSuggestionsMock (derivación de las sugerencias que sirve el backend)', () => {
	it('should head the author scope with the name of the author of its works', () => {
		const suggestions = onoffReadingSuggestionsMock({ author: authorOfWork.slug }, work.slug);

		expect(suggestions.title).toBe(authorOfWork.name);
		suggestions.suggestions.forEach(({ authors }) => {
			expect(authors.some(({ slug }) => slug === authorOfWork.slug)).toBe(true);
		});
	});

	it('should head the collection scope with the title of the collection', () => {
		const suggestions = onoffReadingSuggestionsMock({ collection: collection.slug }, work.slug);

		expect(suggestions.title).toBe(collection.title);
		expect(suggestions.suggestions.length).toBeGreaterThan(0);
	});

	it('should leave the work being read out of the suggestions', () => {
		const suggestions = onoffReadingSuggestionsMock({ author: authorOfWork.slug }, work.slug);

		expect(suggestions.suggestions.map(({ slug }) => slug)).not.toContain(work.slug);
	});

	// El recorte espeja el default de la ruta: el bloque se mira con la cantidad que el backend devuelve
	// cuando el pedido no pide `limit`.
	it('should cap the suggestions at the route default', () => {
		const suggestions = onoffReadingSuggestionsMock({ author: authorOfWork.slug }, 'ninguna-obra');

		expect(suggestions.suggestions).toHaveLength(3);
	});

	it('should serve an empty block for a scope the corpus does not have', () => {
		expect(onoffReadingSuggestionsMock({ author: 'sin-obras' }, work.slug)).toEqual({
			title: '',
			suggestions: [],
		});
		expect(onoffReadingSuggestionsMock({ collection: 'sin-obras' }, work.slug)).toEqual({
			title: '',
			suggestions: [],
		});
	});
});
