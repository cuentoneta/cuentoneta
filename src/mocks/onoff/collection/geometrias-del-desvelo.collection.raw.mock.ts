import descriptionMd from './geometrias-del-desvelo.collection.md?raw';
import { collectionWorks, type RawCollection } from './raw-collection.projection';

// Colección cruda Onoff — "Geometrías del desvelo" (la obsesión por el orden y el tiempo).
// Rama `representative` de imagery: trae su propia portada editorial.
export const geometriasDelDesveloRawCollection: RawCollection = {
	_id: 'onoff-collection-geometrias-del-desvelo',
	slug: 'geometrias-del-desvelo',
	title: 'Geometrías del desvelo',
	description: descriptionMd,
	featuredImage: {
		_type: 'image',
		asset: { _ref: 'image-6efd3e53eec8dfab23e1c0109027be9f58a01f8c-1200x630-png', _type: 'reference' },
	},
	config: { showAuthors: true },
	tags: [],
	mediaSources: [],
	literaryWorks: collectionWorks('geometria', 'los-peldanos', 'las-escaleras'),
};
