import { onoffImageAssets } from '../../onoff-image-assets.mock';
import type { Collection } from '@sanity-types';
import geometriasDelDesveloCollectionMd from './geometrias-del-desvelo.collection.md?raw';

export const geometriasDelDesveloCollectionDocument: Collection = {
	_id: 'onoff-collection-geometrias-del-desvelo',
	_createdAt: '1974-06-12T00:00:00Z',
	_updatedAt: '1974-06-12T00:00:00Z',
	_rev: 'rev-onoff-collection-geometrias-del-desvelo',
	_type: 'collection',
	title: 'Geometrías del desvelo',
	slug: { _type: 'slug', current: 'geometrias-del-desvelo' },
	description: geometriasDelDesveloCollectionMd,
	featuredImage: {
		_type: 'image',
		asset: { _ref: onoffImageAssets.geometriasDelDesveloCover.ref, _type: 'reference' },
	},
	config: { showAuthors: true },
	literaryWorks: [
		{ _key: 'onoff-literary-work-geometria', _type: 'reference', _ref: 'onoff-literary-work-geometria' },
		{ _key: 'onoff-literary-work-los-peldanos', _type: 'reference', _ref: 'onoff-literary-work-los-peldanos' },
		{ _key: 'onoff-literary-work-las-escaleras', _type: 'reference', _ref: 'onoff-literary-work-las-escaleras' },
	],
	tags: [],
	mediaSources: [],
};
