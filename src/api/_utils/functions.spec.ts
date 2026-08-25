import type { SanityImageSource } from '@sanity/image-url';
import {
	mapAuthor,
	mapAuthorTeaser,
	mapBlockContentToTextParagraphs,
	mapContentCampaigns,
	mapHighlightedAuthors,
	mapLandingPageContent,
	mapResources,
	mapStoryNavigationTeaserWithAuthor,
	mapStoryTeaser,
	mapTags,
	urlFor,
} from './functions';
import { elOdioRawTeaser, onoffRawNavTeasersMock } from '@mocks/onoff-raw-stories.mock';
import { rawOnoffAuthor, rawOnoffAuthorTeaser } from '@mocks/onoff-raw-author.mock';
import {
	onoffRawContentCampaignsMock,
	onoffRawHighlightedAuthorsMock,
	onoffRawLandingPageMock,
	overflowingRawHighlightedAuthors,
	untaggedRawHighlightedAuthor,
} from '@mocks/onoff-raw-landing-page.mock';
import type { RotatingContent } from '@models/landing-page-content.model';
import { onoffRawTagsMock } from '@mocks/onoff-raw-tags.mock';
import { withoutUrl } from '@testing/resource-without-url';
import { viewportElementSizes } from '@models/content-campaign.model';

describe('mapTags (ACL)', () => {
	it('maps every raw Sanity tag of the corpus to its domain Tag', () => {
		const result = mapTags(onoffRawTagsMock);

		expect(result.map((tag) => tag.title)).toEqual(onoffRawTagsMock.map((raw) => raw.title));
		expect(result.map((tag) => tag.slug)).toEqual(onoffRawTagsMock.map((raw) => raw.slug));
		expect(result.map((tag) => tag.description)).toEqual(onoffRawTagsMock.map((raw) => raw.description));
	});

	it('exposes exactly the domain contract, dropping everything else from the raw result', () => {
		mapTags(onoffRawTagsMock).forEach((tag) => {
			expect(Object.keys(tag).sort()).toEqual(['description', 'slug', 'title']);
		});
	});

	it('returns an empty array when there are no tags', () => {
		expect(mapTags([])).toEqual([]);
	});
});

// El helper sobrevive a la baja de la descripción de tag con más de una decena de llamadores (biografía,
// recursos, colecciones, cuerpo y epígrafes de story). Su predicado de descarte se ejercita acá porque
// ningún fixture del corpus mezcla elementos no-`block` dentro de un `BlockContent`.
describe('mapBlockContentToTextParagraphs (ACL)', () => {
	const paragraph = {
		_type: 'block' as const,
		_key: 'b1',
		style: 'normal' as const,
		markDefs: [],
		children: [{ _type: 'span' as const, _key: 's1', text: 'texto', marks: [] }],
	};

	it('keeps text blocks and discards everything else', () => {
		const result = mapBlockContentToTextParagraphs([paragraph, { _type: 'image', _key: 'img1' }]);

		expect(result).toEqual([paragraph]);
	});

	it('returns an empty array when there is no text block', () => {
		expect(mapBlockContentToTextParagraphs([{ _type: 'image', _key: 'img1' }])).toEqual([]);
	});
});

describe('mapAuthor (ACL)', () => {
	// Los fragmentos esperados se derivan del Markdown que transporta el propio fixture: enriquecer la
	// prosa del canon no debe romper la aserción.
	const [, boldedSource] = /\*\*(.+?)\*\*/.exec(rawOnoffAuthor.biography) ?? [];
	const [, italicizedSource] = /_(.+?)_/.exec(rawOnoffAuthor.biography) ?? [];

	it('translates the raw Markdown biography of the corpus author into sanitized HTML', () => {
		const result = mapAuthor(rawOnoffAuthor);

		expect(result.biography).toContain('<p>');
		expect(result.biography).toContain(`<strong>${boldedSource}</strong>`);
		expect(result.biography).toContain(`<em>${italicizedSource}</em>`);
		expect(result.biography).not.toContain('**');
	});

	it('throws instead of serving an author whose biography arrived empty', () => {
		expect(() => mapAuthor({ ...rawOnoffAuthor, biography: '' })).toThrow(/Markdown inválido/);
	});
});

describe('mapAuthorTeaser (ACL)', () => {
	it('does not emit a biography: the teaser contract does not declare it', () => {
		expect(mapAuthorTeaser(rawOnoffAuthorTeaser)).not.toHaveProperty('biography');
	});
});

// El input crudo no incluye `tags`: el mapper es la única fuente del campo vacío (consistente con `mapAuthorTeaser`).
describe('mapStoryTeaser (ACL)', () => {
	it('sets tags to [] from the mapper, not from the raw spread', () => {
		const result = mapStoryTeaser([elOdioRawTeaser]);

		expect(result[0].tags).toEqual([]);
	});
});

describe('mapStoryNavigationTeaserWithAuthor (ACL)', () => {
	it('sets tags to [] from the mapper, not from the raw spread', () => {
		const result = mapStoryNavigationTeaserWithAuthor([onoffRawNavTeasersMock[0]]);

		expect(result[0].tags).toEqual([]);
	});
});

describe('mapResources (ACL)', () => {
	it('maps a raw Sanity resource to the domain Resource model', () => {
		const [rawResource] = rawOnoffAuthor.resources;

		const [resource] = mapResources(rawOnoffAuthor.resources);

		expect(resource.title).toBe(rawResource.title);
		expect(resource.url).toBe(rawResource.url);
		expect(resource.resourceType).toMatchObject({
			slug: rawResource.resourceType.slug,
			title: rawResource.resourceType.title,
			description: rawResource.resourceType.description,
		});
	});

	it('exposes exactly the domain contract, dropping everything else from the raw result', () => {
		const [resource] = mapResources(rawOnoffAuthor.resources);

		expect(Object.keys(resource).sort()).toEqual(['resourceType', 'title', 'url']);
		expect(Object.keys(resource.resourceType).sort()).toEqual(['description', 'slug', 'title']);
	});

	it('returns an empty array for an empty, null or undefined input', () => {
		expect(mapResources([])).toEqual([]);
		// REASON: las proyecciones envuelven `resources` en un coalesce, así que el typegen lo declara
		// no-nullable y el `?? []` del mapper queda inalcanzable según el compilador. El guard igual es
		// real ante un cambio de proyección, y se ejercita acotado.
		type RawResources = Parameters<typeof mapResources>[0];
		expect(mapResources(null as unknown as RawResources)).toEqual([]);
		expect(mapResources(undefined as unknown as RawResources)).toEqual([]);
	});

	it('drops a resource whose url is missing, keeping the complete ones', () => {
		const [rawResource] = rawOnoffAuthor.resources;

		const result = mapResources([rawResource, withoutUrl(rawResource)]);

		expect(result).toHaveLength(1);
		expect(result[0].url).toBe(rawResource.url);
	});

	it('drops a resource whose url is null, the shape the dataset actually holds', () => {
		const [rawResource] = rawOnoffAuthor.resources;

		expect(mapResources([{ ...rawResource, url: null as unknown as string }])).toEqual([]);
	});

	it('drops a resource whose url is an empty string', () => {
		const [rawResource] = rawOnoffAuthor.resources;

		expect(mapResources([{ ...rawResource, url: '' }])).toEqual([]);
	});
});

describe('mapContentCampaigns (ACL)', () => {
	it('exposes exactly the domain contract, dropping everything else from the raw result', () => {
		const [campaign] = mapContentCampaigns(onoffRawContentCampaignsMock);

		expect(Object.keys(campaign).sort()).toEqual(['contents', 'slug', 'title', 'url']);
		expect(Object.keys(campaign.contents).sort()).toEqual(['md', 'xs']);
		expect(Object.keys(campaign.contents.xs).sort()).toEqual(['imageHeight', 'imageUrl', 'imageWidth']);
		expect(Object.keys(campaign.contents.md).sort()).toEqual(['imageHeight', 'imageUrl', 'imageWidth']);
	});

	it('falls back to an empty image URL when a viewport has no image', () => {
		const [campaign] = onoffRawContentCampaignsMock;
		const withoutImage = { ...campaign, contents: { xs: { image: null }, md: { image: null } } };

		const [mapped] = mapContentCampaigns([withoutImage]);

		expect(mapped.contents.xs.imageUrl).toBe('');
		expect(mapped.contents.md.imageUrl).toBe('');
	});

	it('maps each viewport to its image URL and fixed dimensions', () => {
		const [campaign] = mapContentCampaigns(onoffRawContentCampaignsMock);

		expect(campaign.contents.xs.imageWidth).toBe(viewportElementSizes.xs.imageWidth);
		expect(campaign.contents.xs.imageHeight).toBe(viewportElementSizes.xs.imageHeight);
		expect(campaign.contents.md.imageWidth).toBe(viewportElementSizes.md.imageWidth);
		expect(campaign.contents.md.imageHeight).toBe(viewportElementSizes.md.imageHeight);
	});

	it('throws when a viewport is missing', () => {
		const [campaign] = onoffRawContentCampaignsMock;
		// REASON: la proyección arma `contents.xs`/`md` siempre, así que el typegen los declara
		// no-nullables y el guard queda inalcanzable según el compilador. El guard igual es real ante
		// un cambio de proyección, y se ejercita acotado — mismo criterio que el cast de urlFor.
		const withoutXs = {
			...campaign,
			contents: { ...campaign.contents, xs: undefined },
		} as unknown as (typeof onoffRawContentCampaignsMock)[number];

		expect(() => mapContentCampaigns([withoutXs])).toThrow('Campaign content not found');
	});
});

describe('mapLandingPageContent (ACL)', () => {
	// El repository invoca al mapper con el spread de dos queries, y la rotación va segunda: aporta lo
	// que la landing no proyecta y, al hacerlo, también pisa su `_id`. El caso reproduce ese orden con
	// una identidad propia para que la aserción distinga cuál de las dos sobrevive.
	const rotatingContent: RotatingContent = { _id: 'rotating-content-onoff', name: 'Rotación de Onoff', mostRead: [] };
	const raw = { ...onoffRawLandingPageMock, ...rotatingContent };

	it('exposes exactly the domain contract, dropping the raw slug and name', () => {
		const result = mapLandingPageContent(raw);

		expect(Object.keys(result).sort()).toEqual([
			'_id',
			'campaigns',
			'cards',
			'config',
			'highlightedAuthors',
			'latestReads',
			'mostRead',
		]);
	});

	it('takes its identity from the rotating content that overrides the landing page', () => {
		const result = mapLandingPageContent(raw);

		expect(result._id).toBe(rotatingContent._id);
		expect(result._id).not.toBe(onoffRawLandingPageMock._id);
	});

	it('preserves the config the query returned', () => {
		expect(mapLandingPageContent(raw).config).toEqual(onoffRawLandingPageMock.config);
	});

	it('maps every campaign the query returned, in order', () => {
		const expectedSlugs = onoffRawLandingPageMock.campaigns.map(({ slug }) => slug);

		expect(expectedSlugs.length).toBeGreaterThan(0);
		expect(mapLandingPageContent(raw).campaigns.map(({ slug }) => slug)).toEqual(expectedSlugs);
	});

	it('maps every highlighted author the query returned, in order', () => {
		const expectedIds = onoffRawLandingPageMock.highlightedAuthors.map(({ author }) => author._id);

		expect(expectedIds.length).toBeGreaterThan(0);
		expect(mapLandingPageContent(raw).highlightedAuthors.map(({ author }) => author._id)).toEqual(expectedIds);
	});
});

describe('mapHighlightedAuthors (ACL)', () => {
	const [canonical] = onoffRawHighlightedAuthorsMock;

	it('maps every tag the author carries, in order', () => {
		const expected = canonical.tags.map(({ slug }) => slug);

		expect(expected.length).toBeGreaterThan(0);
		expect(mapHighlightedAuthors([canonical])[0].tags.map(({ slug }) => slug)).toEqual(expected);
	});

	it('keeps the first six entries when the document carries more', () => {
		const result = mapHighlightedAuthors(overflowingRawHighlightedAuthors);

		expect(overflowingRawHighlightedAuthors.length).toBeGreaterThan(6);
		expect(result.map(({ author }) => author._id)).toEqual(
			overflowingRawHighlightedAuthors.slice(0, 6).map(({ author }) => author._id),
		);
	});

	it('produces an empty tag list for an author with no tags', () => {
		expect(mapHighlightedAuthors([untaggedRawHighlightedAuthor])[0].tags).toEqual([]);
	});

	it('carries the count the query computed', () => {
		expect(mapHighlightedAuthors([canonical])[0].storyCount).toBe(canonical.storyCount);
	});

	// El teaser entrega su lista de etiquetas vacía en toda vista del repositorio, así que las del
	// destacado viajan en el wrapper aunque salgan del mismo autor.
	it('maps the author as a teaser, whose own tag list stays empty', () => {
		const [result] = mapHighlightedAuthors([canonical]);

		expect(result.author).toEqual(mapAuthorTeaser(canonical.author));
		expect(result.author.tags).toEqual([]);
	});

	it('returns an empty array when the document has no highlighted authors', () => {
		expect(mapHighlightedAuthors([])).toEqual([]);
	});
});

describe('urlFor (ACL)', () => {
	it('returns an empty string when the source is null or undefined', () => {
		// REASON: urlFor es una función de propósito general invocada desde varios mappers; su tipo
		// SanityImageSource no incluye null/undefined, pero el guard defensivo es real (llamadores
		// externos al tipo pueden pasar un valor vacío) y se ejercita acotado.
		expect(urlFor(null as unknown as SanityImageSource)).toBe('');
		expect(urlFor(undefined as unknown as SanityImageSource)).toBe('');
	});
});
