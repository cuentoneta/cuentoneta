import type { Collection } from '@sanity-types';
import inventarioDeLasPasionesCollectionMd from './inventario-de-las-pasiones.collection.md?raw';

export const inventarioDeLasPasionesCollectionDocument: Collection = {
	_id: 'onoff-collection-inventario-de-las-pasiones',
	_createdAt: '1974-06-12T00:00:00Z',
	_updatedAt: '1974-06-12T00:00:00Z',
	_rev: 'rev-onoff-collection-inventario-de-las-pasiones',
	_type: 'collection',
	title: 'El inventario de las pasiones',
	slug: { _type: 'slug', current: 'inventario-de-las-pasiones' },
	description: inventarioDeLasPasionesCollectionMd,
	config: { showAuthors: false },
	literaryWorks: [
		{
			_key: 'onoff-literary-work-el-tratado-de-los-placeres',
			_type: 'reference',
			_ref: 'onoff-literary-work-el-tratado-de-los-placeres',
		},
		{ _key: 'onoff-literary-work-el-odio', _type: 'reference', _ref: 'onoff-literary-work-el-odio' },
		{
			_key: 'onoff-literary-work-las-dos-antorchas',
			_type: 'reference',
			_ref: 'onoff-literary-work-las-dos-antorchas',
		},
	],
	tags: [{ _key: 'colaborativa', _type: 'reference', _ref: 'tag-colaborativa' }],
	mediaSources: [],
};
