// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { CollectionBySlugQueryResult } from '@sanity-types';
import {
	dramaHistoricoRawTag,
	dramaPsicologicoRawTag,
	ensayoRawTag,
	experimentalRawTag,
	metaficcionRawTag,
	novelaRawTag,
	teatroRawTag,
	tragediaRawTag,
} from '../../onoff-raw-tags.mock';
import { elOdioSectionTitle } from '../literary-work/el-odio.epigraph';
import ambarYCenizaCollectionMd from './ambar-y-ceniza.collection.md?raw';

export const ambarYCenizaRawCollection: NonNullable<CollectionBySlugQueryResult> = {
	_id: 'onoff-collection-ambar-y-ceniza',
	slug: 'ambar-y-ceniza',
	title: 'Ámbar y ceniza',
	description: ambarYCenizaCollectionMd,
	featuredImage: null,
	config: { showAuthors: false },
	tags: [tragediaRawTag, dramaHistoricoRawTag, ensayoRawTag],
	mediaSources: [],
	literaryWorks: [
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
		{
			_id: 'onoff-literary-work-neron',
			slug: 'neron',
			title: 'Nerón',
			coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-neronCover-236x328-png' } },
			totalReadingTime: 7,
			sectionCount: 1,
			tags: [teatroRawTag, tragediaRawTag, dramaHistoricoRawTag],
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
					body: 'Escribí Nerón porque creí, durante algunos meses, que el incendio podía contarse desde adentro. Me equivoqué con método y precisión, que son las dos únicas formas decentes de equivocarse.',
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
	],
};
