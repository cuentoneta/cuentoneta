import { clearAllMocks, type Mock } from '@test-utils';
import * as storyRepository from './story.repository';
import * as storyService from './story.service';
import type { StoriesByAuthorSlugQueryResult } from '../../sanity/types';
import { elOdioRawStory } from '../../_mocks/onoff/el-odio.raw.mock';
import { elOdioRawTeaser } from '../../_mocks/onoff-raw-stories.mock';

/* eslint-disable no-restricted-syntax -- vi.mock/vi.fn: mock de módulo del repository y del builder de imágenes; se migra a inyección de dependencias en #1503 */
vi.mock('./story.repository', () => ({
	fetchStoriesByAuthorSlug: vi.fn(),
	fetchNavigationTeasersByAuthorSlug: vi.fn(),
	fetchStories: vi.fn(),
	fetchStoriesBySlugs: vi.fn(),
	fetchStoryBySlug: vi.fn(),
}));
vi.mock('@sanity/image-url', () => ({
	createImageUrlBuilder: () => ({
		image: (source: unknown) => ({ url: () => `https://cdn.test/${JSON.stringify(source)}` }),
	}),
}));
/* eslint-enable no-restricted-syntax */

const rawTeaserWithCover: StoriesByAuthorSlugQueryResult[0] = {
	...elOdioRawTeaser,
	coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-abc-100x100-jpg' } },
};

describe('StoryService', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	describe('getStoriesByAuthorSlug — mapeo de coverImage', () => {
		it('should expose coverImage as a string, never the raw Sanity image object', async () => {
			(storyRepository.fetchStoriesByAuthorSlug as Mock).mockResolvedValue([rawTeaserWithCover]);

			const [story] = await storyService.getStoriesByAuthorSlug({ slug: 'francois-onoff', limit: 10, offset: 0 });

			expect(typeof story.coverImage).toBe('string');
			expect(story.coverImage).not.toBeInstanceOf(Object);
		});
	});

	describe('getStoryBySlug — mapeo de coverImage', () => {
		it('should expose coverImage as a URL string built from the raw Sanity image', async () => {
			(storyRepository.fetchStoryBySlug as Mock).mockResolvedValue(elOdioRawStory);

			const story = await storyService.getStoryBySlug('el-odio');

			expect(typeof story.coverImage).toBe('string');
			expect(story.coverImage).not.toBe('');
		});
	});
});
