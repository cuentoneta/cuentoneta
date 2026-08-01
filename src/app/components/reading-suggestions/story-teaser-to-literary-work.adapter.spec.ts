import {
	onoffStoryNavigationTeasersMock,
	onoffStoryNavigationTeasersWithAuthorMock,
} from '@mocks/onoff-story-teasers.mock';
import {
	adaptStoryTeaserToLiteraryWorkTeaser,
	adaptStoryTeasersToLiteraryWorkTeasers,
} from './story-teaser-to-literary-work.adapter';
import { spyOn, restoreAllMocks } from '@test-utils';

describe('adaptStoryTeaserToLiteraryWorkTeaser', () => {
	it('should carry over the fields the card renders', () => {
		const [story] = onoffStoryNavigationTeasersWithAuthorMock;

		const literaryWork = adaptStoryTeaserToLiteraryWorkTeaser(story);

		expect(literaryWork).toMatchObject({
			_id: story._id,
			slug: story.slug,
			title: story.title,
			coverImage: story.coverImage,
			tags: story.tags,
			mediaSources: story.media,
		});
	});

	it('should map the story author to the single-element author list', () => {
		const [story] = onoffStoryNavigationTeasersWithAuthorMock;

		expect(adaptStoryTeaserToLiteraryWorkTeaser(story).authors).toEqual([story.author]);
	});

	it('should leave the author list empty when the projection has no author', () => {
		const [story] = onoffStoryNavigationTeasersMock;

		expect(adaptStoryTeaserToLiteraryWorkTeaser(story).authors).toEqual([]);
	});

	it('should report a single section, since a story has no sections', () => {
		for (const story of onoffStoryNavigationTeasersMock) {
			expect(adaptStoryTeaserToLiteraryWorkTeaser(story).sectionCount).toBe(1);
		}
	});

	it('should round the approximate reading time to a valid ReadingTime', () => {
		const [story] = onoffStoryNavigationTeasersMock;

		expect(adaptStoryTeaserToLiteraryWorkTeaser({ ...story, approximateReadingTime: 7.4 }).totalReadingTime).toBe(7);
	});

	it('should floor the reading time at one minute', () => {
		const [story] = onoffStoryNavigationTeasersMock;

		expect(adaptStoryTeaserToLiteraryWorkTeaser({ ...story, approximateReadingTime: 0 }).totalReadingTime).toBe(1);
	});

	it('should reject a story whose slug is not a valid slug', () => {
		const [story] = onoffStoryNavigationTeasersMock;

		expect(() => adaptStoryTeaserToLiteraryWorkTeaser({ ...story, slug: 'Slug Inválido' })).toThrow(/Slug inválido/);
	});
});

describe('adaptStoryTeasersToLiteraryWorkTeasers', () => {
	afterEach(() => {
		restoreAllMocks();
	});

	it('should adapt every story of the listing', () => {
		expect(adaptStoryTeasersToLiteraryWorkTeasers(onoffStoryNavigationTeasersMock)).toHaveLength(
			onoffStoryNavigationTeasersMock.length,
		);
	});

	it('should drop only the stories it cannot adapt, keeping the rest', () => {
		spyOn(console, 'warn').mockImplementation(() => undefined);
		const [first, ...rest] = onoffStoryNavigationTeasersMock;

		const adapted = adaptStoryTeasersToLiteraryWorkTeasers([{ ...first, slug: 'Slug Inválido' }, ...rest]);

		expect(adapted).toHaveLength(rest.length);
		expect(adapted.map((literaryWork) => literaryWork.slug)).toEqual(rest.map((story) => story.slug));
	});

	it('should report the discarded story preserving its cause', () => {
		const warn = spyOn(console, 'warn').mockImplementation(() => undefined);
		const [first] = onoffStoryNavigationTeasersMock;

		adaptStoryTeasersToLiteraryWorkTeasers([{ ...first, slug: 'Slug Inválido' }]);

		expect(warn).toHaveBeenCalledWith(expect.stringContaining('Slug Inválido'), expect.any(Error));
	});
});
