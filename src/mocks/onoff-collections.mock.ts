import {
	createCollection,
	type Collection,
	type CollectionImagery,
	type CollectionTeaser,
} from '@models/collection.model';
import { createMarkdown } from '@models/markdown.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';

import geometriasDescriptionMd from './onoff/geometrias-del-desvelo.collection.md?raw';
import inventarioDescriptionMd from './onoff/inventario-de-las-pasiones.collection.md?raw';
import { onoffLiteraryWorkTeasersMock } from './onoff-literary-work-teasers.mock';
import { colaborativaTagMock, cuentoTagMock } from './onoff-tags.mock';

const geometriasWorks = onoffLiteraryWorkTeasersMock.slice(0, 3);
const inventarioWorks = onoffLiteraryWorkTeasersMock.slice(0, 3);

// Las tres portadas salen de las propias obras, no escritas a mano: es lo que el mapper deriva
// cuando la colección no tiene portada editorial.
function sampleFrom(works: typeof onoffLiteraryWorkTeasersMock): CollectionImagery {
	const [first, second, third] = works.map((work) => work.coverImage);
	return { kind: 'sample', images: [first ?? '', second ?? '', third ?? ''] };
}

/** Colección con portada editorial propia — la rama `representative` de `imagery`. */
export const geometriasDelDesveloCollectionMock: Collection = createCollection({
	_id: 'collection-geometrias-del-desvelo',
	slug: 'geometrias-del-desvelo',
	title: 'Geometrías del desvelo',
	description: markdownToSanitizedHtml(createMarkdown(geometriasDescriptionMd)),
	imagery: { kind: 'representative', image: 'assets/img/mocks/collections/geometrias-del-desvelo.png' },
	tags: [colaborativaTagMock],
	config: { showAuthors: true },
	mediaSources: [],
	literaryWorks: geometriasWorks,
});

/** Colección sin portada propia — la rama `sample`, derivada de las portadas de sus obras. */
export const inventarioDeLasPasionesCollectionMock: Collection = createCollection({
	_id: 'collection-inventario-de-las-pasiones',
	slug: 'inventario-de-las-pasiones',
	title: 'Inventario de las pasiones',
	description: markdownToSanitizedHtml(createMarkdown(inventarioDescriptionMd)),
	imagery: sampleFrom(inventarioWorks),
	tags: [cuentoTagMock],
	config: { showAuthors: false },
	mediaSources: [],
	literaryWorks: inventarioWorks,
});

export const onoffCollectionsMock: Collection[] = [
	geometriasDelDesveloCollectionMock,
	inventarioDeLasPasionesCollectionMock,
];

// El teaser es una proyección: no pasa por la factory porque no transporta obras, igual que lo
// construye el mapper a partir de la query.
function toTeaser(collection: Collection): CollectionTeaser {
	return { ...collection, literaryWorks: [] };
}

export const geometriasDelDesveloCollectionTeaserMock: CollectionTeaser = toTeaser(geometriasDelDesveloCollectionMock);
export const inventarioDeLasPasionesCollectionTeaserMock: CollectionTeaser = toTeaser(
	inventarioDeLasPasionesCollectionMock,
);

export const onoffCollectionTeasersMock: CollectionTeaser[] = onoffCollectionsMock.map(toTeaser);
