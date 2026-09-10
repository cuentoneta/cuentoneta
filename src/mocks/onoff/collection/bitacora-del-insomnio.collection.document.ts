import type { Collection } from '@sanity-types';
import bitacoraDelInsomnioCollectionMd from './bitacora-del-insomnio.collection.md?raw';

// Omite `tags` y `config`, que las dos queries resuelven con `coalesce`: es la colección que ejercita
// esos defaults, y la única del elenco que no aporta ninguna faceta al panel de filtros.
export const bitacoraDelInsomnioCollectionDocument: Collection = {
	_id: 'onoff-collection-bitacora-del-insomnio',
	_createdAt: '1986-07-19T00:00:00Z',
	_updatedAt: '1986-07-19T00:00:00Z',
	_rev: 'rev-onoff-collection-bitacora-del-insomnio',
	_type: 'collection',
	title: 'Bitácora del insomnio',
	slug: { _type: 'slug', current: 'bitacora-del-insomnio' },
	description: bitacoraDelInsomnioCollectionMd,
	literaryWorks: [
		{ _key: 'onoff-literary-work-geometria', _type: 'reference', _ref: 'onoff-literary-work-geometria' },
		{ _key: 'onoff-literary-work-el-odio', _type: 'reference', _ref: 'onoff-literary-work-el-odio' },
		{
			_key: 'onoff-literary-work-el-palacio-de-las-nueve-fronteras',
			_type: 'reference',
			_ref: 'onoff-literary-work-el-palacio-de-las-nueve-fronteras',
		},
	],
	mediaSources: [],
};
