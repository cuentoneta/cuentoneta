// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { CollectionsQueryResult } from '@sanity-types';
import { collectionTeaserFrom } from '../derive-raw';
import { ambarYCenizaRawCollection } from './ambar-y-ceniza.collection.raw.mock';
import { bitacoraDelInsomnioRawCollection } from './bitacora-del-insomnio.collection.raw.mock';
import { cuadernosDelMeridienRawCollection } from './cuadernos-del-meridien.collection.raw.mock';
import { geometriasDelDesveloRawCollection } from './geometrias-del-desvelo.collection.raw.mock';
import { inventarioDeLasPasionesRawCollection } from './inventario-de-las-pasiones.collection.raw.mock';
import { reyesDeUtileriaRawCollection } from './reyes-de-utileria.collection.raw.mock';

export const onoffRawCollectionTeasersMock: CollectionsQueryResult = [
	{
		...collectionTeaserFrom(bitacoraDelInsomnioRawCollection),
		count: 3,
		literaryWorkCoverImages: [
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-geometriaCover-236x328-png' } },
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-elOdioCover-236x328-png' } },
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-elPalacioDeLasNueveFronterasCover-236x328-png' } },
		],
	},
	{
		...collectionTeaserFrom(cuadernosDelMeridienRawCollection),
		count: 3,
		literaryWorkCoverImages: [
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-elPalacioDeLasNueveFronterasCover-236x328-png' } },
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-elTratadoDeLosPlaceresCover-236x328-png' } },
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-lasEscalerasCover-236x328-png' } },
		],
	},
	{
		...collectionTeaserFrom(inventarioDeLasPasionesRawCollection),
		count: 3,
		literaryWorkCoverImages: [
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-elTratadoDeLosPlaceresCover-236x328-png' } },
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-elOdioCover-236x328-png' } },
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-lasDosAntorchasCover-236x328-png' } },
		],
	},
	{
		...collectionTeaserFrom(geometriasDelDesveloRawCollection),
		count: 3,
		literaryWorkCoverImages: [
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-geometriaCover-236x328-png' } },
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-losPeldanosCover-236x328-png' } },
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-lasEscalerasCover-236x328-png' } },
		],
	},
	{
		...collectionTeaserFrom(reyesDeUtileriaRawCollection),
		count: 3,
		literaryWorkCoverImages: [
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-neronCover-236x328-png' } },
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-elPalacioDeLasNueveFronterasCover-236x328-png' } },
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-losPeldanosCover-236x328-png' } },
		],
	},
	{
		...collectionTeaserFrom(ambarYCenizaRawCollection),
		count: 3,
		literaryWorkCoverImages: [
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-lasDosAntorchasCover-236x328-png' } },
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-neronCover-236x328-png' } },
			{ _type: 'image', asset: { _type: 'reference', _ref: 'image-elOdioCover-236x328-png' } },
		],
	},
];
