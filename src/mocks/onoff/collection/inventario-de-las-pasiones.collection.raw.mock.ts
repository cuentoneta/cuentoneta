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
			excerpt: [
				{
					_key: 'section-1',
					title: null,
					body: 'Conviene advertir, antes de toda enumeración, que un tratado de los placeres no es un repertorio de placeres sino su contrario exacto. Quien escribe _esto_ ya ha dejado de gozar; ha pasado al otro lado de la mesa, donde se mide y se nombra.',
				},
			],
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
			excerpt: [
				{
					_key: 'section-1',
					title: elOdioSectionTitle,
					body: 'No empezó por nada. Eso es lo primero que conviene aclarar. No hubo un agravio, ni una herida, ni una infancia que pudiera invocarse después como excusa. El odio estaba ahí desde antes, igual que el peso del cuerpo o el color de los ojos, una propiedad y no un acontecimiento.',
				},
			],
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
			excerpt: [
				{
					_key: 'section-1',
					title: null,
					body: 'El corredor no tenía principio que alguien recordara. Avanzábamos por él como se avanza en un cálculo: sin esperanza de llegada, atentos sólo a no perder el hilo. Dos antorchas iban con nosotros, una a cada lado, y desde el primer paso comprendí que nunca alumbrarían lo mismo.',
				},
			],
		},
	],
};
