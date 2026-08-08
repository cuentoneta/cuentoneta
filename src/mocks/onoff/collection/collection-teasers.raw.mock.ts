// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { CollectionsQueryResult } from '@sanity-types';
import geometriasDelDesveloCollectionMd from './geometrias-del-desvelo.collection.md?raw';
import inventarioDeLasPasionesCollectionMd from './inventario-de-las-pasiones.collection.md?raw';

export const onoffRawCollectionTeasersMock: CollectionsQueryResult = [
	{
		_id: 'onoff-collection-inventario-de-las-pasiones',
		slug: 'inventario-de-las-pasiones',
		title: 'El inventario de las pasiones',
		description: inventarioDeLasPasionesCollectionMd,
		featuredImage: null,
		config: { showAuthors: false },
		tags: [],
		mediaSources: [],
		count: 3,
		literaryWorkCoverImages: [
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-elTratadoDeLosPlaceresCover-236x328-png' } },
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-elOdioCover-236x328-png' } },
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-lasDosAntorchasCover-236x328-png' } },
		],
	},
	{
		_id: 'onoff-collection-geometrias-del-desvelo',
		slug: 'geometrias-del-desvelo',
		title: 'Geometrías del desvelo',
		description: geometriasDelDesveloCollectionMd,
		featuredImage: {
			_type: 'image',
			asset: { _ref: 'image-geometriasDelDesveloCover-236x328-png', _type: 'reference' },
		},
		config: { showAuthors: true },
		tags: [],
		mediaSources: [],
		count: 3,
		literaryWorkCoverImages: [
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-geometriaCover-236x328-png' } },
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-losPeldanosCover-236x328-png' } },
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-lasEscalerasCover-236x328-png' } },
		],
	},
];
