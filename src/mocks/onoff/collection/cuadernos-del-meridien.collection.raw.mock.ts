// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { CollectionBySlugQueryResult } from '@sanity-types';
import {
	absurdoRawTag,
	alegoriaRawTag,
	colaborativaRawTag,
	dramaPsicologicoRawTag,
	ensayoRawTag,
	filosoficoRawTag,
	metaficcionRawTag,
	novelaRawTag,
} from '../../onoff-raw-tags.mock';
import { palacioNueveFronterasSectionTitle } from '../literary-work/el-palacio-de-las-nueve-fronteras.epigraph';
import cuadernosDelMeridienCollectionMd from './cuadernos-del-meridien.collection.md?raw';

export const cuadernosDelMeridienRawCollection: NonNullable<CollectionBySlugQueryResult> = {
	_id: 'onoff-collection-cuadernos-del-meridien',
	slug: 'cuadernos-del-meridien',
	title: 'Cuadernos del Méridien: los años de taller y las obras corregidas a posteriori',
	description: cuadernosDelMeridienCollectionMd,
	featuredImage: null,
	config: { showAuthors: true },
	tags: [colaborativaRawTag, ensayoRawTag, metaficcionRawTag],
	mediaSources: [],
	literaryWorks: [
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
			_id: 'onoff-literary-work-las-escaleras',
			slug: 'las-escaleras',
			title: 'Las escaleras',
			coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-lasEscalerasCover-236x328-png' } },
			totalReadingTime: 9,
			sectionCount: 1,
			tags: [novelaRawTag, absurdoRawTag, alegoriaRawTag],
			mediaSources: [{ _type: 'audioRecording', title: 'Lectura de "Las escaleras" por su autor' }],
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
					body: 'Dos años después la encontré donde la había dejado, al pie de la escalera, midiendo con el pulgar la distancia exacta que separaba un peldaño del siguiente. La Sra. Oneiras no había envejecido; se había vuelto más precisa, como una cifra que se repite hasta perder su sentido.',
				},
			],
		},
	],
};
