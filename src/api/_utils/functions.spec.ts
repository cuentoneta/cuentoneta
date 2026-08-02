import type { SanityImageSource } from '@sanity/image-url';
import {
	mapBlockContentToTextParagraphs,
	mapContentCampaigns,
	mapLandingPageContent,
	mapResources,
	mapStoryNavigationTeaser,
	mapStoryNavigationTeaserWithAuthor,
	mapStoryTeaser,
	mapTags,
	urlFor,
} from './functions';
import { elOdioRawTeaser, onoffRawNavTeasersMock } from '@mocks/onoff-raw-stories.mock';
import { rawOnoffAuthor } from '@mocks/onoff-raw-author.mock';
import { onoffRawContentCampaignsMock } from '@mocks/onoff-raw-content-campaigns.mock';
import { onoffRawTagsMock } from '@mocks/onoff-raw-tags.mock';
import { viewportElementSizes } from '@models/content-campaign.model';

describe('mapTags (ACL)', () => {
	it('maps every raw Sanity tag of the corpus to its domain Tag', () => {
		const result = mapTags(onoffRawTagsMock);

		expect(result.map((tag) => tag.title)).toEqual(onoffRawTagsMock.map((raw) => raw.title));
		expect(result.map((tag) => tag.slug)).toEqual(onoffRawTagsMock.map((raw) => raw.slug));
		expect(result.map((tag) => tag.shortDescription)).toEqual(onoffRawTagsMock.map((raw) => raw.shortDescription));
	});

	it('exposes exactly the domain contract, dropping everything else from the raw result', () => {
		mapTags(onoffRawTagsMock).forEach((tag) => {
			expect(Object.keys(tag).sort()).toEqual(['shortDescription', 'slug', 'title']);
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

// El input crudo no incluye `tags`: el mapper es la única fuente del campo vacío (consistente con `mapAuthorTeaser`).
describe('mapStoryTeaser (ACL)', () => {
	it('sets tags to [] from the mapper, not from the raw spread', () => {
		const result = mapStoryTeaser([elOdioRawTeaser]);

		expect(result[0].tags).toEqual([]);
	});
});

describe('mapStoryNavigationTeaser (ACL)', () => {
	it('sets tags to [] from the mapper, not from the raw spread', () => {
		const result = mapStoryNavigationTeaser([elOdioRawTeaser]);

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
			shortDescription: rawResource.resourceType.shortDescription,
			icon: { provider: 'fa', name: 'fa-wikipedia-w' },
		});
	});

	it('exposes exactly the domain contract, dropping everything else from the raw result', () => {
		const [resource] = mapResources(rawOnoffAuthor.resources);

		expect(Object.keys(resource).sort()).toEqual(['resourceType', 'title', 'url']);
		expect(Object.keys(resource.resourceType).sort()).toEqual(['icon', 'shortDescription', 'slug', 'title']);
	});

	it('normalizes a missing icon provider/name to empty strings', () => {
		const [rawResource] = rawOnoffAuthor.resources;
		const withoutIcon = {
			...rawResource,
			resourceType: { ...rawResource.resourceType, icon: { _type: 'iconPicker' as const } },
		};

		const [resource] = mapResources([withoutIcon]);

		expect(resource.resourceType.icon).toEqual({ provider: '', name: '' });
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
	it('exposes exactly the domain contract, dropping the raw slug and name', () => {
		const result = mapLandingPageContent({
			_id: 'onoff-landing-page',
			slug: 'semana-de-onoff',
			config: 'onoff',
			name: 'Rotación de Onoff',
			cards: [],
			campaigns: onoffRawContentCampaignsMock,
			latestReads: [],
			mostRead: [],
		});

		expect(Object.keys(result).sort()).toEqual(['_id', 'campaigns', 'cards', 'config', 'latestReads', 'mostRead']);
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
