import { onoffImageAssets } from './onoff-image-assets.mock';
import type { RotatingContentQueryResult, StoryBySlugQueryResult } from '@sanity-types';
import onoffBiographyMdBody from './onoff/author/francois-onoff.biography.md?raw';

export const rawOnoffAuthor: NonNullable<StoryBySlugQueryResult>['author'] = {
	_id: 'author_1',
	slug: 'francois-onoff',
	name: 'François Onoff',
	image: {
		_type: 'image',
		asset: { _type: 'reference', _ref: onoffImageAssets.francoisOnoffPortrait.ref },
	},
	nationality: {
		_id: 'nationality-francia',
		_type: 'nationality',
		_createdAt: '2021-12-28T00:00:00Z',
		_updatedAt: '2021-12-28T00:00:00Z',
		_rev: 'rev-francia',
		country: 'Francia',
		flag: {
			_type: 'image',
			asset: { _type: 'reference', _ref: onoffImageAssets.franceFlag.ref },
		},
	},
	biography: onoffBiographyMdBody,
	bornOn: '1948-01-01',
	bornOnYear: 1948,
	diedOn: '1994-12-31',
	diedOnYear: 1994,
	resources: [
		{
			title: 'Artículo de François Onoff en Wikipedia',
			url: 'https://es.wikipedia.org/wiki/Francois_Onoff',
			resourceType: {
				slug: 'wikipedia',
				title: 'Wikipedia',
				description: 'Enlace a artículo de Wikipedia',
			},
		},
	],
	tags: [],
};

export const rawOnoffAuthorTeaser: NonNullable<RotatingContentQueryResult>['mostRead'][0]['author'] = {
	_id: 'author_1',
	slug: 'francois-onoff',
	name: 'François Onoff',
	image: {
		_type: 'image',
		asset: { _type: 'reference', _ref: onoffImageAssets.francoisOnoffPortrait.ref },
	},
	nationality: {
		_id: 'nationality-francia',
		_type: 'nationality',
		_createdAt: '2021-12-28T00:00:00Z',
		_updatedAt: '2021-12-28T00:00:00Z',
		_rev: 'rev-francia',
		country: 'Francia',
		flag: {
			_type: 'image',
			asset: { _type: 'reference', _ref: onoffImageAssets.franceFlag.ref },
		},
	},
	bornOn: '1948-01-01',
	bornOnYear: 1948,
	diedOn: '1994-12-31',
	diedOnYear: 1994,
	resources: [],
};
