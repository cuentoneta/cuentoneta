import { clearAllMocks, type Mock } from '@test-utils';
import * as storyRepository from './story.repository';
import * as storyService from './story.service';
import { StoriesByAuthorSlugQueryResult } from '../../sanity/types';

/* eslint-disable no-restricted-syntax -- vi.mock/vi.fn: mock de módulo del repository; se migra a inyección de dependencias en #1503 */
vi.mock('./story.repository', () => ({
	fetchStoriesByAuthorSlug: vi.fn(),
	fetchNavigationTeasersByAuthorSlug: vi.fn(),
	fetchStories: vi.fn(),
	fetchStoriesBySlugs: vi.fn(),
	fetchStoryBySlug: vi.fn(),
}));
/* eslint-enable no-restricted-syntax */

// REASON: el shape crudo de la query es extenso; el cast acota el mock a los campos que el mapper consume.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- REASON: coverImage crudo es image | null; el test cubre ambos
function rawStoryTeaser(coverImage: any) {
	return {
		_id: 'story-1',
		slug: 'historia-1',
		title: 'Historia 1',
		badLanguage: false,
		body: [],
		originalPublication: '',
		approximateReadingTime: 2,
		coverImage,
		mediaSources: [],
		resources: [],
		tags: [],
	};
}

describe('StoryService', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	describe('getStoriesByAuthorSlug — mapeo de coverImage', () => {
		it('should map coverImage to an empty string when the story has no image', async () => {
			(storyRepository.fetchStoriesByAuthorSlug as Mock).mockResolvedValue([
				rawStoryTeaser(null),
			] as unknown as StoriesByAuthorSlugQueryResult);

			const [story] = await storyService.getStoriesByAuthorSlug({ slug: 'autor', limit: 10, offset: 0 });

			expect(story.coverImage).toBe('');
		});

		it('should expose coverImage as a string, never the raw Sanity image object', async () => {
			(storyRepository.fetchStoriesByAuthorSlug as Mock).mockResolvedValue([
				rawStoryTeaser({ _type: 'image', asset: { _type: 'reference', _ref: 'image-abc-100x100-jpg' } }),
			] as unknown as StoriesByAuthorSlugQueryResult);

			const [story] = await storyService.getStoriesByAuthorSlug({ slug: 'autor', limit: 10, offset: 0 });

			expect(typeof story.coverImage).toBe('string');
		});
	});
});
