import {
	onoffStoryNavigationTeasersMock,
	onoffStoryNavigationTeasersWithAuthorMock,
} from '@mocks/onoff-story-teasers.mock';
import {
	adaptStoryTeaserToReadingSuggestion,
	adaptStoryTeasersToReadingSuggestions,
} from './story-teaser-to-reading-suggestion.adapter';
import { spyOn, restoreAllMocks } from '@test-utils';

describe('adaptStoryTeaserToReadingSuggestion', () => {
	it('should carry over the fields the card renders', () => {
		const [story] = onoffStoryNavigationTeasersWithAuthorMock;

		const { literaryWork } = adaptStoryTeaserToReadingSuggestion(story);

		expect(literaryWork).toMatchObject({
			_id: story._id,
			slug: story.slug,
			title: story.title,
			coverImage: story.coverImage,
			tags: story.tags,
			mediaSources: story.media,
		});
	});

	// El extracto viaja aparte de la obra: la proyección de teaser lo trae recortado y el adapter lo
	// transporta tal cual, sin convertirlo — la tarjeta lo renderiza como Portable Text.
	it('should carry the story body as the excerpt', () => {
		const [story] = onoffStoryNavigationTeasersWithAuthorMock;

		expect(adaptStoryTeaserToReadingSuggestion(story).excerptParagraphs).toBe(story.paragraphs);
	});

	it('should map the story author to the single-element author list', () => {
		const [story] = onoffStoryNavigationTeasersWithAuthorMock;

		expect(adaptStoryTeaserToReadingSuggestion(story).literaryWork.authors).toEqual([story.author]);
	});

	it('should leave the author list empty when the projection has no author', () => {
		const [story] = onoffStoryNavigationTeasersMock;

		expect(adaptStoryTeaserToReadingSuggestion(story).literaryWork.authors).toEqual([]);
	});

	it('should report a single section, since a story has no sections', () => {
		for (const story of onoffStoryNavigationTeasersMock) {
			expect(adaptStoryTeaserToReadingSuggestion(story).literaryWork.sectionCount).toBe(1);
		}
	});

	it('should round the approximate reading time to a valid ReadingTime', () => {
		const [story] = onoffStoryNavigationTeasersMock;

		expect(
			adaptStoryTeaserToReadingSuggestion({ ...story, approximateReadingTime: 7.4 }).literaryWork.totalReadingTime,
		).toBe(7);
	});

	it('should floor the reading time at one minute', () => {
		const [story] = onoffStoryNavigationTeasersMock;

		expect(
			adaptStoryTeaserToReadingSuggestion({ ...story, approximateReadingTime: 0 }).literaryWork.totalReadingTime,
		).toBe(1);
	});

	it('should reject a story whose slug is not a valid slug', () => {
		const [story] = onoffStoryNavigationTeasersMock;

		expect(() => adaptStoryTeaserToReadingSuggestion({ ...story, slug: 'Slug Inválido' })).toThrow(/Slug inválido/);
	});
});

describe('adaptStoryTeasersToReadingSuggestions', () => {
	afterEach(() => {
		restoreAllMocks();
	});

	it('should adapt every story of the listing', () => {
		expect(adaptStoryTeasersToReadingSuggestions(onoffStoryNavigationTeasersMock)).toHaveLength(
			onoffStoryNavigationTeasersMock.length,
		);
	});

	it('should drop only the stories it cannot adapt, keeping the rest', () => {
		spyOn(console, 'warn').mockImplementation(() => undefined);
		const [first, ...rest] = onoffStoryNavigationTeasersMock;

		const adapted = adaptStoryTeasersToReadingSuggestions([{ ...first, slug: 'Slug Inválido' }, ...rest]);

		expect(adapted).toHaveLength(rest.length);
		expect(adapted.map((suggestion) => suggestion.literaryWork.slug)).toEqual(rest.map((story) => story.slug));
	});

	it('should report the discarded story preserving its cause', () => {
		const warn = spyOn(console, 'warn').mockImplementation(() => undefined);
		const [first] = onoffStoryNavigationTeasersMock;

		adaptStoryTeasersToReadingSuggestions([{ ...first, slug: 'Slug Inválido' }]);

		expect(warn).toHaveBeenCalledWith(expect.stringContaining('Slug Inválido'), expect.any(Error));
	});
});
