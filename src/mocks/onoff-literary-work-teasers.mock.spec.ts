import {
	onoffLiteraryWorkNavigationTeasersMock,
	onoffLiteraryWorkNavigationTeasersWithAuthorsMock,
	onoffLiteraryWorkTeasersMock,
	palacioNueveFronterasLiteraryWorkTeaserMock,
} from './onoff-literary-work-teasers.mock';
import { onoffLiteraryWorksMock } from './onoff-literary-works.mock';
import { palacioNueveFronterasLiteraryWorkMock } from './onoff/literary-work/el-palacio-de-las-nueve-fronteras.literary-work.mock';

describe('onoffLiteraryWorkTeasersMock (derivación de teasers desde LiteraryWork)', () => {
	it('should expose the first section of the source work as teaserSection', () => {
		expect(palacioNueveFronterasLiteraryWorkTeaserMock.teaserSection).toBe(
			palacioNueveFronterasLiteraryWorkMock.content[0],
		);
		for (const teaser of onoffLiteraryWorkTeasersMock) {
			expect(teaser.teaserSection.position).toBe(0);
		}
	});

	it('should carry a rendered bodyHtml in the teaser section', () => {
		for (const teaser of onoffLiteraryWorkTeasersMock) {
			expect(teaser.teaserSection.bodyHtml).toContain('<p>');
		}
	});

	it('should summarize authors (at least one author teaser)', () => {
		for (const teaser of onoffLiteraryWorkTeasersMock) {
			expect(teaser.authors.length).toBeGreaterThan(0);
		}
	});

	it('should not carry the full-view fields (content, resources, dates)', () => {
		for (const teaser of onoffLiteraryWorkTeasersMock) {
			expect(teaser).not.toHaveProperty('content');
			expect(teaser).not.toHaveProperty('resources');
			expect(teaser).not.toHaveProperty('originalPublication');
			expect(teaser).not.toHaveProperty('publishedAt');
		}
	});
});

describe('navigation teasers de LiteraryWork (proyección de la vista base)', () => {
	// El .map preserva el orden, así que el teaser en el índice i deriva de onoffLiteraryWorksMock[i].
	it('should preserve the base-view fields from the source work', () => {
		onoffLiteraryWorkNavigationTeasersMock.forEach((teaser, index) => {
			const source = onoffLiteraryWorksMock[index];
			expect(teaser._id).toBe(source._id);
			expect(teaser.slug).toBe(source.slug);
			expect(teaser.title).toBe(source.title);
			expect(teaser.coverImage).toBe(source.coverImage);
			expect(teaser.totalReadingTime).toBe(source.totalReadingTime);
			expect(teaser.sectionCount).toBe(source.sectionCount);
			expect(teaser.tags).toBe(source.tags);
			expect(teaser.mediaSources).toBe(source.mediaSources);
		});
	});

	it('should leave authors empty in the plain navigation teaser', () => {
		for (const teaser of onoffLiteraryWorkNavigationTeasersMock) {
			expect(teaser.authors).toHaveLength(0);
		}
	});

	it('should summarize the source work authors to AuthorTeaser in the with-authors variant', () => {
		onoffLiteraryWorkNavigationTeasersWithAuthorsMock.forEach((teaser, index) => {
			const source = onoffLiteraryWorksMock[index];
			// Los autores derivan de la obra fuente (no de un mock fijo), preservando slug y nombre...
			expect(teaser.authors.map((author) => author.slug)).toEqual(source.authors.map((author) => author.slug));
			expect(teaser.authors[0].name).toBe(source.authors[0].name);
			// ...pero la variante AuthorTeaser no declara la biografía y vacía los recursos.
			expect(teaser.authors[0]).not.toHaveProperty('biography');
			expect(teaser.authors[0].resources).toHaveLength(0);
		});
	});

	it('should not carry full-view, paratext nor teaser fields', () => {
		for (const teaser of [
			...onoffLiteraryWorkNavigationTeasersMock,
			...onoffLiteraryWorkNavigationTeasersWithAuthorsMock,
		]) {
			expect(teaser).not.toHaveProperty('content');
			expect(teaser).not.toHaveProperty('resources');
			expect(teaser).not.toHaveProperty('originalPublication');
			expect(teaser).not.toHaveProperty('publishedAt');
			expect(teaser).not.toHaveProperty('editorialNote');
			expect(teaser).not.toHaveProperty('teaserSection');
		}
	});
});
