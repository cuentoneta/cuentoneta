import { clearAllMocks, type Mock } from '@test-utils';
import * as storyRepository from './story.repository';
import * as storyService from './story.service';
import type { StoriesByAuthorSlugQueryResult, StoryBySlugQueryResult } from '../../sanity/types';
import { elOdioRawStory } from '../../_mocks/onoff/el-odio.raw.mock';
import { elOdioRawTeaser } from '../../_mocks/onoff-raw-stories.mock';

/* eslint-disable no-restricted-syntax -- vi.mock/vi.fn: mock de módulo del repository; se migra a inyección de dependencias en #1503 */
vi.mock('./story.repository', () => ({
	fetchStoriesByAuthorSlug: vi.fn(),
	fetchNavigationTeasersByAuthorSlug: vi.fn(),
	fetchStories: vi.fn(),
	fetchStoriesBySlugs: vi.fn(),
	fetchStoryBySlug: vi.fn(),
}));
/* eslint-enable no-restricted-syntax */

// REASON: GROQ devuelve null para stories sin imagen; el typegen declara coverImage non-nullable.
const rawTeaserNoCover: StoriesByAuthorSlugQueryResult[0] = {
	...elOdioRawTeaser,
	coverImage: null as unknown as StoriesByAuthorSlugQueryResult[0]['coverImage'],
};

const rawTeaserWithCover: StoriesByAuthorSlugQueryResult[0] = {
	...elOdioRawTeaser,
	coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-abc-100x100-jpg' } },
};

// REASON: GROQ devuelve null para stories sin imagen; el typegen declara coverImage non-nullable.
const rawContentNoCover: NonNullable<StoryBySlugQueryResult> = {
	...elOdioRawStory,
	coverImage: null as unknown as NonNullable<StoryBySlugQueryResult>['coverImage'],
};

describe('StoryService', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	describe('getStoriesByAuthorSlug — mapeo de coverImage', () => {
		it('should map coverImage to an empty string when the story has no image', async () => {
			(storyRepository.fetchStoriesByAuthorSlug as Mock).mockResolvedValue([rawTeaserNoCover]);

			const [story] = await storyService.getStoriesByAuthorSlug({ slug: 'francois-onoff', limit: 10, offset: 0 });

			expect(story.coverImage).toBe('');
		});

		it('should expose coverImage as a string, never the raw Sanity image object', async () => {
			(storyRepository.fetchStoriesByAuthorSlug as Mock).mockResolvedValue([rawTeaserWithCover]);

			const [story] = await storyService.getStoriesByAuthorSlug({ slug: 'francois-onoff', limit: 10, offset: 0 });

			expect(typeof story.coverImage).toBe('string');
			expect(story.coverImage).not.toBeInstanceOf(Object);
		});
	});

	describe('getStoryBySlug — mapeo de coverImage', () => {
		it('should map coverImage to an empty string when the story has no image', async () => {
			(storyRepository.fetchStoryBySlug as Mock).mockResolvedValue(rawContentNoCover);

			const story = await storyService.getStoryBySlug('el-odio');

			expect(story.coverImage).toBe('');
		});
	});
});
