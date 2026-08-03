import {
	onoffStoryNavigationTeasersMock,
	onoffStoryNavigationTeasersWithAuthorMock,
	onoffStoryTeasersMock,
	palacioNueveFronterasTeaserMock,
} from './onoff-story-teasers.mock';
import { palacioNueveFronterasStoryMock } from './onoff/el-palacio-de-las-nueve-fronteras.mock';

describe('onoffStoryTeasersMock (derivación de teasers desde Story)', () => {
	it('should truncate every teaser body to the first 3 paragraphs', () => {
		expect(palacioNueveFronterasStoryMock.paragraphs.length).toBeGreaterThan(3);
		for (const teaser of onoffStoryTeasersMock) {
			expect(teaser.paragraphs).toHaveLength(3);
		}
	});

	it('should keep exactly the first 3 paragraphs of the source story', () => {
		expect(palacioNueveFronterasTeaserMock.paragraphs).toEqual(palacioNueveFronterasStoryMock.paragraphs.slice(0, 3));
	});

	it('should not carry the full-view fields (summary, epigraphs, dates)', () => {
		for (const teaser of onoffStoryTeasersMock) {
			expect(teaser).not.toHaveProperty('summary');
			expect(teaser).not.toHaveProperty('epigraphs');
			expect(teaser).not.toHaveProperty('publishedAt');
			expect(teaser).not.toHaveProperty('updatedAt');
		}
	});
});

describe('onoffStoryNavigationTeasersMock (derivación de vistas de navegación)', () => {
	it('should empty the body of every navigation teaser', () => {
		for (const teaser of [...onoffStoryNavigationTeasersWithAuthorMock, ...onoffStoryNavigationTeasersMock]) {
			expect(teaser.paragraphs).toHaveLength(0);
		}
	});

	it('should not project the tags, which the navigation queries leave out', () => {
		for (const teaser of [...onoffStoryNavigationTeasersWithAuthorMock, ...onoffStoryNavigationTeasersMock]) {
			expect(teaser.tags).toHaveLength(0);
		}
	});

	it('should keep the author only in the with-author projection', () => {
		for (const teaser of onoffStoryNavigationTeasersWithAuthorMock) {
			expect(teaser.author).toBeDefined();
		}
		for (const teaser of onoffStoryNavigationTeasersMock) {
			expect(teaser).not.toHaveProperty('author');
		}
	});

	it('should cover the whole corpus', () => {
		expect(onoffStoryNavigationTeasersMock).toHaveLength(onoffStoryTeasersMock.length);
	});
});
