import type { Collection } from '@sanity-types';
import reyesDeUtileriaCollectionMd from './reyes-de-utileria.collection.md?raw';

export const reyesDeUtileriaCollectionDocument: Collection = {
	_id: 'onoff-collection-reyes-de-utileria',
	_createdAt: '1990-05-24T00:00:00Z',
	_updatedAt: '1990-05-24T00:00:00Z',
	_rev: 'rev-onoff-collection-reyes-de-utileria',
	_type: 'collection',
	title: 'Reyes de utilería',
	slug: { _type: 'slug', current: 'reyes-de-utileria' },
	description: reyesDeUtileriaCollectionMd,
	config: { showAuthors: true },
	literaryWorks: [
		{ _key: 'onoff-literary-work-neron', _type: 'reference', _ref: 'onoff-literary-work-neron' },
		{
			_key: 'onoff-literary-work-el-palacio-de-las-nueve-fronteras',
			_type: 'reference',
			_ref: 'onoff-literary-work-el-palacio-de-las-nueve-fronteras',
		},
		{ _key: 'onoff-literary-work-los-peldanos', _type: 'reference', _ref: 'onoff-literary-work-los-peldanos' },
	],
	tags: [
		{ _key: 'teatro', _type: 'reference', _ref: 'tag-teatro' },
		{ _key: 'tragedia', _type: 'reference', _ref: 'tag-tragedia' },
	],
	mediaSources: [],
};
