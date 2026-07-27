import {
	onoffLiteraryWorkTeasersMock,
	palacioNueveFronterasLiteraryWorkTeaserMock,
} from './onoff-literary-work-teasers.mock';
import { palacioNueveFronterasLiteraryWorkMock } from './onoff/el-palacio-de-las-nueve-fronteras.mock';

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
