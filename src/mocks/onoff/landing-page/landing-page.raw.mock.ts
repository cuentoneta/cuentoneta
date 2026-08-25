// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LandingPageContentQueryResult } from '@sanity-types';
import { cuentoRawTag, dramaPsicologicoRawTag, metaficcionRawTag } from '../../onoff-raw-tags.mock';

export const onoffRawLandingPageMock: NonNullable<LandingPageContentQueryResult> = {
	_id: 'onoff-landing-page-1974-24',
	slug: '1974-24',
	config: '1974-24',
	cards: [],
	campaigns: [
		{
			_id: 'onoff-content-campaign-coleccion-completa-onoff',
			title: 'Diez tapas, una sola obra',
			slug: 'coleccion-completa-onoff',
			url: '../author/francois-onoff',
			contents: {
				xs: {
					image: {
						_type: 'image',
						asset: { _type: 'reference', _ref: 'image-0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b-540x220-png' },
					},
				},
				md: {
					image: {
						_type: 'image',
						asset: { _type: 'reference', _ref: 'image-2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d-1240x360-png' },
					},
				},
			},
		},
		{
			_id: 'onoff-content-campaign-el-palacio-de-las-nueve-fronteras',
			title: 'El palacio de las nueve fronteras',
			slug: 'el-palacio-de-las-nueve-fronteras',
			url: '../story/el-palacio-de-las-nueve-fronteras',
			contents: {
				xs: {
					image: {
						_type: 'image',
						asset: { _type: 'reference', _ref: 'image-1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c-540x220-png' },
					},
				},
				md: {
					image: {
						_type: 'image',
						asset: { _type: 'reference', _ref: 'image-3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e-1240x360-png' },
					},
				},
			},
		},
	],
	latestReads: [],
	highlightedAuthors: [
		{
			author: {
				_id: 'author_1',
				slug: 'francois-onoff',
				name: 'François Onoff',
				image: { _type: 'image', asset: { _type: 'reference', _ref: 'image-francoisOnoffPortrait-1254x1254-png' } },
				nationality: {
					_id: 'nationality-francia',
					_type: 'nationality',
					_createdAt: '2021-12-28T00:00:00Z',
					_updatedAt: '2021-12-28T00:00:00Z',
					_rev: 'rev-francia',
					country: 'Francia',
					flag: { _type: 'image', asset: { _type: 'reference', _ref: 'image-franceFlag-30x20-png' } },
				},
				bornOn: '1948-01-01',
				bornOnYear: 1948,
				diedOn: '1994-12-31',
				diedOnYear: 1994,
				resources: [],
				tags: [cuentoRawTag, dramaPsicologicoRawTag],
			},
			additionalTags: [cuentoRawTag, metaficcionRawTag],
			storyCount: 8,
		},
	],
};
