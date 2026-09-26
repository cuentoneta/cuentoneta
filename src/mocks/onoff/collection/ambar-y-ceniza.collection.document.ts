import type { Collection } from '@sanity-types';
import ambarYCenizaCollectionMd from './ambar-y-ceniza.collection.md?raw';

// Comparte obras con otras colecciones del elenco: la curaduría acá es el fuego que llega tarde, y una
// obra puede entrar por ese ángulo y por el de otra colección sin dejar de ser la misma.
export const ambarYCenizaCollectionDocument: Collection = {
	_id: 'onoff-collection-ambar-y-ceniza',
	_createdAt: '1989-03-02T00:00:00Z',
	_updatedAt: '1989-03-02T00:00:00Z',
	_rev: 'rev-onoff-collection-ambar-y-ceniza',
	_type: 'collection',
	title: 'Ámbar y ceniza',
	slug: { _type: 'slug', current: 'ambar-y-ceniza' },
	description: ambarYCenizaCollectionMd,
	config: { showAuthors: false },
	literaryWorks: [
		{
			_key: 'onoff-literary-work-las-dos-antorchas',
			_type: 'reference',
			_ref: 'onoff-literary-work-las-dos-antorchas',
		},
		{ _key: 'onoff-literary-work-neron', _type: 'reference', _ref: 'onoff-literary-work-neron' },
		{ _key: 'onoff-literary-work-el-odio', _type: 'reference', _ref: 'onoff-literary-work-el-odio' },
	],
	tags: [
		{ _key: 'tragedia', _type: 'reference', _ref: 'tag-tragedia' },
		{ _key: 'drama-historico', _type: 'reference', _ref: 'tag-drama-historico' },
		{ _key: 'ensayo', _type: 'reference', _ref: 'tag-ensayo' },
	],
	mediaSources: [],
};
