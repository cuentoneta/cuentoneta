// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { CollectionBySlugQueryResult } from '@sanity-types';
import {
	absurdoRawTag,
	cuentoRawTag,
	dramaHistoricoRawTag,
	dramaPsicologicoRawTag,
	metaficcionRawTag,
	novelaRawTag,
	surrealismoRawTag,
	teatroRawTag,
	tragediaRawTag,
} from '../../onoff-raw-tags.mock';
import { palacioNueveFronterasSectionTitle } from '../literary-work/el-palacio-de-las-nueve-fronteras.epigraph';
import reyesDeUtileriaCollectionMd from './reyes-de-utileria.collection.md?raw';

export const reyesDeUtileriaRawCollection: NonNullable<CollectionBySlugQueryResult> = {
	_id: 'onoff-collection-reyes-de-utileria',
	slug: 'reyes-de-utileria',
	title: 'Reyes de utilería',
	description: reyesDeUtileriaCollectionMd,
	featuredImage: null,
	config: { showAuthors: true },
	tags: [teatroRawTag, tragediaRawTag],
	mediaSources: [],
	literaryWorks: [
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
			_id: 'onoff-literary-work-el-palacio-de-las-nueve-fronteras',
			slug: 'el-palacio-de-las-nueve-fronteras',
			title: 'El palacio de las nueve fronteras',
			coverImage: {
				_type: 'image',
				asset: { _type: 'reference', _ref: 'image-elPalacioDeLasNueveFronterasCover-236x328-png' },
			},
			totalReadingTime: 11,
			sectionCount: 1,
			tags: [novelaRawTag, dramaPsicologicoRawTag, metaficcionRawTag],
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
					title: palacioNueveFronterasSectionTitle,
					body: 'La primera frontera no tiene nombre porque el nombre se quedó del otro lado, con los que no cruzaron. Avancé al amanecer, cuando la nieve aún no decidía si caer, y el funcionario que revisó mis papeles no levantó la vista. Escribí entonces la primera línea, que no era mía: era de un hombre que había visto caer una hora antes, en una plaza sin testigos, con un orden tan limpio que parecía ensayado.',
				},
			],
		},
		{
			_id: 'onoff-literary-work-los-peldanos',
			slug: 'los-peldanos',
			title: 'Los peldaños',
			coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-losPeldanosCover-236x328-png' } },
			totalReadingTime: 8,
			sectionCount: 1,
			tags: [cuentoRawTag, absurdoRawTag, surrealismoRawTag],
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
					body: 'La escalera empezaba en ninguna parte y terminaba un poco más arriba de eso. La Sra. Oneiras vivía en alguno de sus peldaños, aunque jamás conseguí determinar en cuál, porque cada vez que creía haberlo hecho el peldaño se desplazaba, o yo me desplazaba, o el día entero cambiaba de número sin avisarle a nadie.',
				},
			],
		},
	],
};
