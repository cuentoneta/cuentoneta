import { onoffStoryTeasersMock, palacioNueveFronterasTeaserMock } from './onoff-story-teasers.mock';
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
