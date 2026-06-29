import { clearAllMocks, type Mock } from '@test-utils';
import * as storyRepository from './story.repository';
import * as storyService from './story.service';
import { StoriesByAuthorSlugQueryResult, StoryBySlugQueryResult } from '../../sanity/types';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- REASON: coverImage crudo es image | null; el test cubre el caso null
function rawStoryContent(coverImage: any) {
	return {
		_id: 'story-1',
		slug: 'historia-1',
		title: 'Historia 1',
		badLanguage: false,
		epigraphs: [],
		body: [],
		review: [],
		originalPublication: '',
		publishedAt: '2024-01-01T00:00:00Z',
		updatedAt: '2024-01-01T00:00:00Z',
		approximateReadingTime: 2,
		coverImage,
		mediaSources: [],
		resources: [],
		tags: [],
		author: {
			_id: 'author-1',
			slug: 'autor',
			name: 'Autor',
			image: null,
			nationality: { country: 'AR', flag: null },
			biography: [],
			bornOn: null,
			bornOnYear: null,
			diedOn: null,
			diedOnYear: null,
			resources: [],
			tags: [],
		},
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
			expect(story.coverImage).not.toBeInstanceOf(Object);
		});
	});

	describe('getStoryBySlug — mapeo de coverImage', () => {
		it('should map coverImage to an empty string when the story has no image', async () => {
			(storyRepository.fetchStoryBySlug as Mock).mockResolvedValue(
				rawStoryContent(null) as unknown as StoryBySlugQueryResult,
			);

			const story = await storyService.getStoryBySlug('historia-1');

			expect(story.coverImage).toBe('');
		});
	});
});
