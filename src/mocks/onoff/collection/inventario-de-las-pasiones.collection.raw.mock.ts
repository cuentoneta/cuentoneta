// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { CollectionBySlugQueryResult } from '@sanity-types';
import {
	colaborativaRawTag,
	dramaPsicologicoRawTag,
	ensayoRawTag,
	experimentalRawTag,
	filosoficoRawTag,
	metaficcionRawTag,
	novelaRawTag,
} from '../../onoff-raw-tags.mock';
import { elOdioSectionTitle } from '../literary-work/el-odio.epigraph';
import elOdioMdBody from '../literary-work/el-odio.md?raw';
import elTratadoDeLosPlaceresMdBody from '../literary-work/el-tratado-de-los-placeres.md?raw';
import lasDosAntorchasMdBody from '../literary-work/las-dos-antorchas.md?raw';
import inventarioDeLasPasionesCollectionMd from './inventario-de-las-pasiones.collection.md?raw';

export const inventarioDeLasPasionesRawCollection: NonNullable<CollectionBySlugQueryResult> = {
	_id: 'onoff-collection-inventario-de-las-pasiones',
	slug: 'inventario-de-las-pasiones',
	title: 'El inventario de las pasiones',
	description: inventarioDeLasPasionesCollectionMd,
	featuredImage: null,
	config: { showAuthors: false },
	tags: [colaborativaRawTag],
	mediaSources: [],
	literaryWorks: [
		{
			_id: 'onoff-literary-work-el-tratado-de-los-placeres',
			slug: 'el-tratado-de-los-placeres',
			title: 'El tratado de los placeres',
			coverImage: {
				_type: 'image',
				asset: { _type: 'reference', _ref: 'image-elTratadoDeLosPlaceresCover-236x328-png' },
			},
			totalReadingTime: 10,
			sectionCount: 1,
			tags: [ensayoRawTag, filosoficoRawTag, metaficcionRawTag],
			mediaSources: [],
			authors: [
				{
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
				},
			],
			excerpt: [{ _key: 'section-1', title: null, body: elTratadoDeLosPlaceresMdBody }],
			openingReadingTime: 10,
			readingTimeFallbackBody: null,
		},
		{
			_id: 'onoff-literary-work-el-odio',
			slug: 'el-odio',
			title: 'El odio',
			coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-elOdioCover-236x328-png' } },
			totalReadingTime: 6,
			sectionCount: 1,
			tags: [novelaRawTag, dramaPsicologicoRawTag],
			mediaSources: [],
			authors: [
				{
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
				},
			],
			excerpt: [{ _key: 'section-1', title: elOdioSectionTitle, body: elOdioMdBody }],
			openingReadingTime: 6,
			readingTimeFallbackBody: null,
		},
		{
			_id: 'onoff-literary-work-las-dos-antorchas',
			slug: 'las-dos-antorchas',
			title: 'Las dos antorchas',
			coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-lasDosAntorchasCover-236x328-png' } },
			totalReadingTime: 8,
			sectionCount: 1,
			tags: [novelaRawTag, metaficcionRawTag, experimentalRawTag],
			mediaSources: [],
			authors: [
				{
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
				},
			],
			excerpt: [{ _key: 'section-1', title: null, body: lasDosAntorchasMdBody }],
			openingReadingTime: 8,
			readingTimeFallbackBody: null,
		},
	],
};
