import type { SanityImageSource } from '@sanity/image-url';
import {
	mapContentCampaigns,
	mapLandingPageContent,
	mapStoryNavigationTeaser,
	mapStoryNavigationTeaserWithAuthor,
	mapStoryTeaser,
	mapTags,
	urlFor,
} from './functions';
import { elOdioRawTeaser, onoffRawNavTeasersMock } from '@mocks/onoff-raw-stories.mock';
import { onoffRawContentCampaignsMock } from '@mocks/onoff-raw-content-campaigns.mock';
import { viewportElementSizes } from '@models/content-campaign.model';

describe('mapTags (ACL)', () => {
	it('maps a raw Sanity tag to the domain Tag model', () => {
		const result = mapTags([
			{
				title: 'Cumpleaños',
				slug: 'cumpleanos',
				shortDescription: 'Etiqueta de cumpleaños',
				description: [
					{
						_type: 'block',
						_key: 'b1',
						style: 'normal',
						markDefs: [],
						children: [{ _type: 'span', _key: 's1', text: 'Etiqueta de cumpleaños', marks: [] }],
					},
				],
				icon: { _type: 'iconPicker', provider: 'mdi', name: 'cake' },
			},
		]);

		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({
			title: 'Cumpleaños',
			slug: 'cumpleanos',
			shortDescription: 'Etiqueta de cumpleaños',
			icon: { provider: 'mdi', name: 'cake' },
		});
		expect(result[0].description).toHaveLength(1);
		expect(result[0].description[0]._type).toBe('block');
	});

	it('normalizes missing icon provider/name to empty strings', () => {
		const result = mapTags([
			{
				title: 'Sin ícono',
				slug: 'sin-icono',
				shortDescription: 'desc',
				description: [],
				icon: { _type: 'iconPicker' },
			},
		]);

		expect(result[0].icon).toEqual({ provider: '', name: '' });
	});

	it('discards non-text-block elements from the description', () => {
		const result = mapTags([
			{
				title: 'Mixto',
				slug: 'mixto',
				shortDescription: 'desc',
				description: [
					{
						_type: 'block',
						_key: 'b1',
						style: 'normal',
						markDefs: [],
						children: [{ _type: 'span', _key: 's1', text: 'texto', marks: [] }],
					},
					{ _type: 'image', _key: 'img1' },
				],
				icon: { _type: 'iconPicker', provider: 'mdi', name: 'tag' },
			},
		]);

		expect(result[0].description).toHaveLength(1);
		expect(result[0].description[0]._type).toBe('block');
	});

	it('returns an empty array when there are no tags', () => {
		expect(mapTags([])).toEqual([]);
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
