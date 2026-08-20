import type { CollectionBySlugQueryResult, CollectionsQueryResult } from '@sanity-types';

import { onoffRawCollectionTeasersMock as generatedTeasers } from './onoff/collection/collection-teasers.raw.mock';
import { geometriasDelDesveloRawCollection } from './onoff/collection/geometrias-del-desvelo.collection.raw.mock';
import { inventarioDeLasPasionesRawCollection } from './onoff/collection/inventario-de-las-pasiones.collection.raw.mock';

type RawCollection = NonNullable<CollectionBySlugQueryResult>;

export const onoffRawCollectionsMock: RawCollection[] = [
	geometriasDelDesveloRawCollection,
	inventarioDeLasPasionesRawCollection,
];

// Llega ordenado por título, que es el criterio de `collectionsQuery` y no el orden en que este módulo
// declara las colecciones.
export const onoffRawCollectionTeasersMock: CollectionsQueryResult = generatedTeasers;

// Selectores por capacidad, derivados por predicado y no como listas paralelas: un spec pide la rama
// que necesita sin atarse a la colección que exista hoy.
export const onoffRawCollectionsWithFeaturedImage: RawCollection[] = onoffRawCollectionsMock.filter(
	(collection) => collection.featuredImage !== null,
);

export const onoffRawCollectionsWithoutFeaturedImage: RawCollection[] = onoffRawCollectionsMock.filter(
	(collection) => collection.featuredImage === null,
);

// Las obras embebidas que declaran multimedia, que son las que ejercitan el mapeo de la vista de
// teaser. Su proyección solo trae el tag, así que el shape difiere del de las obras de nivel documento.
export const onoffRawCollectionWorksWithMediaSources: RawCollection['literaryWorks'] = onoffRawCollectionsMock
	.flatMap((collection) => collection.literaryWorks)
	.filter((work) => work.mediaSources.length > 0);

// Escenarios de borde, construidos por spread sobre el canon para que cambien con él.
// Los cuatro primeros son datos que impiden construir el agregado.

export const emptyRawCollection: RawCollection = { ...geometriasDelDesveloRawCollection, literaryWorks: [] };

export const shortSampleRawCollection: RawCollection = {
	...inventarioDeLasPasionesRawCollection,
	literaryWorks: inventarioDeLasPasionesRawCollection.literaryWorks.slice(0, 2),
};

export const descriptionlessRawCollection: RawCollection = {
	...geometriasDelDesveloRawCollection,
	description: '',
};

export const sectionlessWorkRawCollection: RawCollection = {
	...geometriasDelDesveloRawCollection,
	literaryWorks: geometriasDelDesveloRawCollection.literaryWorks.map((work, index) =>
		index === 0 ? { ...work, excerpt: [], sectionCount: 0 } : work,
	),
};

// No es un dato mal curado: es el shape de un borrador, cuya obra todavía no pasó por el backfill de
// reading time. Cae al segundo eslabón de la cadena, el tiempo de la sección de apertura.
export const draftLikeRawCollection: RawCollection = {
	...geometriasDelDesveloRawCollection,
	literaryWorks: geometriasDelDesveloRawCollection.literaryWorks.map((work, index) =>
		index === 0 ? { ...work, totalReadingTime: null } : work,
	),
};

// El tercer eslabón: ni el total de la obra ni el tiempo de su sección de apertura están
// persistidos, así que el único origen posible es derivarlo del cuerpo completo — que la proyección
// materializa solo en este caso.
export const unbackfilledWorkRawCollection: RawCollection = {
	...geometriasDelDesveloRawCollection,
	literaryWorks: geometriasDelDesveloRawCollection.literaryWorks.map((work, index) =>
		index === 0
			? {
					...work,
					totalReadingTime: null,
					openingReadingTime: null,
					readingTimeFallbackBody: work.excerpt[0]?.body ?? '',
				}
			: work,
	),
};
