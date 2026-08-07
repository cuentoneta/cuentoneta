// Documento tal como Sanity lo guarda. Es fuente escrita a mano: la fixture cruda de esta obra se
// deriva de acá evaluando la query real con `pnpm corpus:generate`.
import type { Collection } from '@sanity-types';

export const geometriasDelDesveloCollectionDocument: Collection = {
	_id: 'onoff-collection-geometrias-del-desvelo',
	_createdAt: '1974-06-12T00:00:00Z',
	_updatedAt: '1974-06-12T00:00:00Z',
	_rev: 'rev-onoff-collection-geometrias-del-desvelo',
	_type: 'collection',
	title: 'Geometrías del desvelo',
	slug: { _type: 'slug', current: 'geometrias-del-desvelo' },
	description:
		'Onoff lleva la precisión del compás al territorio de lo humano: insomnios que se vuelven una geometría del tiempo, vidas reducidas a coordenadas, figuras que prometen un orden perfecto y terminan revelando, en algún vértice, su grieta.\r\n',
	featuredImage: {
		_type: 'image',
		asset: { _ref: 'image-6efd3e53eec8dfab23e1c0109027be9f58a01f8c-1200x630-png', _type: 'reference' },
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
