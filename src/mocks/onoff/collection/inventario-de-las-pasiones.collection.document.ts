// Documento tal como Sanity lo guarda. Es fuente escrita a mano: la fixture cruda de esta obra se
// deriva de acá evaluando la query real con `pnpm corpus:generate`.
import type { Collection } from '@sanity-types';

export const inventarioDeLasPasionesCollectionDocument: Collection = {
	_id: 'onoff-collection-inventario-de-las-pasiones',
	_createdAt: '1974-06-12T00:00:00Z',
	_updatedAt: '1974-06-12T00:00:00Z',
	_rev: 'rev-onoff-collection-inventario-de-las-pasiones',
	_type: 'collection',
	title: 'El inventario de las pasiones',
	slug: { _type: 'slug', current: 'inventario-de-las-pasiones' },
	description:
		'Una colección sobre el deseo de ordenar lo inordenable. Onoff cataloga el placer, retrata el odio sin causa y enfrenta dos antorchas que nunca alumbran lo mismo: tratados que terminan por descubrir que toda taxonomía de lo humano es una forma elegante de perderlo.\r\n',
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
	tags: [],
	mediaSources: [],
};
