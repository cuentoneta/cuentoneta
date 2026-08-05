import type { RotatingContentQueryResult, StoryBySlugQueryResult } from '@sanity-types';
import onoffBiographyMdBody from './onoff/francois-onoff.biography.md?raw';

export const rawOnoffAuthor: NonNullable<StoryBySlugQueryResult>['author'] = {
	_id: 'author_1',
	slug: 'francois-onoff',
	name: 'François Onoff',
	image: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-f656d95d41369adb6f7d3a7d0b20b36861fd2028-350x350-jpg' },
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
			asset: { _type: 'reference', _ref: 'image-b80876a5f3a89e13acc14254b1f45dd6d29b79f4-30x20-png' },
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
		asset: { _type: 'reference', _ref: 'image-f656d95d41369adb6f7d3a7d0b20b36861fd2028-350x350-jpg' },
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
			asset: { _type: 'reference', _ref: 'image-b80876a5f3a89e13acc14254b1f45dd6d29b79f4-30x20-png' },
		},
	},
	bornOn: '1948-01-01',
	bornOnYear: 1948,
	diedOn: '1994-12-31',
	diedOnYear: 1994,
	resources: [],
};
