import {
	onoffStoryNavigationTeasersMock,
	onoffStoryNavigationTeasersWithAuthorMock,
	onoffStoryTeasersMock,
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
	//
	// Se afirma contra la proyección de teaser y no contra la de navegación: esta última declara
	// `paragraphs: []`, así que la igualdad se cumpliría por identidad de un array vacío sin probar que
	// un cuerpo real llegue a destino.
	it('should carry the story body as the excerpt', () => {
		const [story] = onoffStoryTeasersMock;

		expect(story.paragraphs.length).toBeGreaterThan(0);
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

	// El campo es requerido en el schema, pero esa regla solo rige la edición: hay obras publicadas sin
	// el valor, y así es como llegan desde Sanity.
	it('should reject a story whose reading time is missing, naming the story', () => {
		const [story] = onoffStoryNavigationTeasersMock;
		const withoutReadingTime = { ...story, approximateReadingTime: undefined as unknown as number };

		expect(() => adaptStoryTeaserToReadingSuggestion(withoutReadingTime)).toThrow(/no tiene tiempo de lectura/);
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

	it('should drop a story whose reading time is missing, keeping the rest', () => {
		spyOn(console, 'warn').mockImplementation(() => undefined);
		const [first, ...rest] = onoffStoryNavigationTeasersMock;
		const withoutReadingTime = { ...first, approximateReadingTime: undefined as unknown as number };

		const adapted = adaptStoryTeasersToReadingSuggestions([withoutReadingTime, ...rest]);

		expect(adapted).toHaveLength(rest.length);
	});

	it('should report the discarded story preserving its cause', () => {
		const warn = spyOn(console, 'warn').mockImplementation(() => undefined);
		const [first] = onoffStoryNavigationTeasersMock;

		adaptStoryTeasersToReadingSuggestions([{ ...first, slug: 'Slug Inválido' }]);

		expect(warn).toHaveBeenCalledWith(expect.stringContaining('Slug Inválido'), expect.any(Error));
	});
});
