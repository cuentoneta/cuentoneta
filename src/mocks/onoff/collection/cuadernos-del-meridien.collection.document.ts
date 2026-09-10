import type { Collection } from '@sanity-types';
import cuadernosDelMeridienCollectionMd from './cuadernos-del-meridien.collection.md?raw';

// La única colección del elenco cuya prosa trae un enlace propio, que es lo que distingue las dos caras
// de la descripción: el ACL las sanea con pipelines distintos y el teaser sale sin él.
export const cuadernosDelMeridienCollectionDocument: Collection = {
	_id: 'onoff-collection-cuadernos-del-meridien',
	_createdAt: '1991-11-08T00:00:00Z',
	_updatedAt: '1991-11-08T00:00:00Z',
	_rev: 'rev-onoff-collection-cuadernos-del-meridien',
	_type: 'collection',
	title: 'Cuadernos del Méridien: los años de taller y las obras corregidas a posteriori',
	slug: { _type: 'slug', current: 'cuadernos-del-meridien' },
	description: cuadernosDelMeridienCollectionMd,
	config: { showAuthors: true },
	literaryWorks: [
		{
			_key: 'onoff-literary-work-el-palacio-de-las-nueve-fronteras',
			_type: 'reference',
			_ref: 'onoff-literary-work-el-palacio-de-las-nueve-fronteras',
		},
		{
			_key: 'onoff-literary-work-el-tratado-de-los-placeres',
			_type: 'reference',
			_ref: 'onoff-literary-work-el-tratado-de-los-placeres',
		},
		{
			_key: 'onoff-literary-work-las-escaleras',
			_type: 'reference',
			_ref: 'onoff-literary-work-las-escaleras',
		},
	],
	tags: [
		{ _key: 'colaborativa', _type: 'reference', _ref: 'tag-colaborativa' },
		{ _key: 'ensayo', _type: 'reference', _ref: 'tag-ensayo' },
		{ _key: 'metaficcion', _type: 'reference', _ref: 'tag-metaficcion' },
	],
	mediaSources: [],
};
