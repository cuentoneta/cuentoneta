import { onoffLiteraryWorkCatalogMock } from './onoff-literary-work-catalog.mock';
import { onoffLiteraryWorksMock } from './onoff-literary-works.mock';

describe('onoffLiteraryWorkCatalogMock (derivación del catálogo desde LiteraryWork)', () => {
	// La guarda que evita que un selector vacío llegue a sus consumidores — ver `testing.md`.
	it('exposes one catalog entry per work of the canon', () => {
		expect(onoffLiteraryWorkCatalogMock.length).toBeGreaterThan(0);
		expect(onoffLiteraryWorkCatalogMock.map(({ slug }) => slug)).toEqual(
			onoffLiteraryWorksMock.map(({ slug }) => slug),
		);
	});

	it('should carry only what the catalog lists', () => {
		for (const entry of onoffLiteraryWorkCatalogMock) {
			expect(Object.keys(entry).sort()).toEqual(['authors', 'slug', 'title', 'totalReadingTime']);
			expect(entry.authors.length).toBeGreaterThan(0);
		}
	});
});
