import descriptionMd from './inventario-de-las-pasiones.collection.md?raw';
import { collectionWorks, type RawCollection } from './raw-collection.projection';

// Colección cruda Onoff — "El inventario de las pasiones" (el placer, el odio y las dos antorchas).
// Rama `sample` de imagery: sin portada propia, el abanico sale de las portadas de sus obras.
export const inventarioDeLasPasionesRawCollection: RawCollection = {
	_id: 'onoff-collection-inventario-de-las-pasiones',
	slug: 'inventario-de-las-pasiones',
	title: 'El inventario de las pasiones',
	description: descriptionMd,
	featuredImage: null,
	config: { showAuthors: false },
	tags: [],
	mediaSources: [],
	literaryWorks: collectionWorks('el-tratado-de-los-placeres', 'el-odio', 'las-dos-antorchas'),
};
