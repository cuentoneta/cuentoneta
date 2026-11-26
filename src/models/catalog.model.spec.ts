import { createCatalog } from './catalog.model';
import { onoffLiteraryWorkCatalogEntriesMock } from '@mocks/onoff-literary-work-catalog-entries.mock';

describe('createCatalog', () => {
	const entries = onoffLiteraryWorkCatalogEntriesMock;

	it('builds a frozen envelope with the entries in the order it receives them', () => {
		const reversed = [...entries].reverse();

		const catalog = createCatalog(reversed, reversed.length);

		expect(catalog.entries).toEqual(reversed);
		expect(catalog.total).toBe(reversed.length);
		expect(Object.isFrozen(catalog)).toBe(true);
		expect(Object.isFrozen(catalog.entries)).toBe(true);
	});

	it('copies the entries, so mutating the source afterwards does not alter the catalog', () => {
		const source = [...entries];
		const catalog = createCatalog(source, source.length);

		source.pop();

		expect(catalog.entries).toHaveLength(entries.length);
	});

	// Es la forma de una página del catálogo paginado: lista algunas entradas de un total mayor.
	it('accepts a total greater than the entries it lists', () => {
		const [first] = entries;

		expect(createCatalog([first], entries.length).total).toBe(entries.length);
	});

	it('accepts the empty catalogue', () => {
		expect(createCatalog([], 0)).toEqual({ entries: [], total: 0 });
	});

	it.each([-1, 1.5, Number.NaN])('rejects a total of %s', (total) => {
		expect(() => createCatalog([], total)).toThrow('Catalog inválido');
	});

	it('rejects a total smaller than the entries it lists, naming both numbers', () => {
		const [first, second] = entries;

		expect(() => createCatalog([first, second], 1)).toThrow('Catalog inválido: total 1 para 2 entradas');
	});
});
