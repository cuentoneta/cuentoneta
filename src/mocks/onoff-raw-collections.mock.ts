import type { CollectionBySlugQueryResult, CollectionsQueryResult } from '@sanity-types';

import { onoffRawCollectionTeasersMock as generatedTeasers } from './onoff/collection/collection-teasers.raw.mock';
import { geometriasDelDesveloRawCollection } from './onoff/collection/geometrias-del-desvelo.collection.raw.mock';
import { inventarioDeLasPasionesRawCollection } from './onoff/collection/inventario-de-las-pasiones.collection.raw.mock';

type RawCollection = NonNullable<CollectionBySlugQueryResult>;

export const onoffRawCollectionsMock: RawCollection[] = [
	geometriasDelDesveloRawCollection,
	inventarioDeLasPasionesRawCollection,
];

// El listado ya no se deriva acá: lo escribe el generador evaluando `collectionsQuery`, así que llega
// ordenado por título como en producción y no en el orden de `onoffRawCollectionsMock`.
export const onoffRawCollectionTeasersMock: CollectionsQueryResult = generatedTeasers;

// Selectores por capacidad, derivados por predicado y no como listas paralelas: un spec pide la rama
// que necesita sin atarse a la colección que exista hoy.
export const onoffRawCollectionsWithFeaturedImage: RawCollection[] = onoffRawCollectionsMock.filter(
	(collection) => collection.featuredImage !== null,
);

export const onoffRawCollectionsWithoutFeaturedImage: RawCollection[] = onoffRawCollectionsMock.filter(
	(collection) => collection.featuredImage === null,
);

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
		index === 0 ? { ...work, teaserSection: [], sectionCount: 0 } : work,
	),
};

// No es un dato mal curado: es el shape de un borrador, cuya obra todavía no pasó por el backfill de
// reading time. Cubre la única rama que el opcional del tipo obliga a escribir.
export const draftLikeRawCollection: RawCollection = {
	...geometriasDelDesveloRawCollection,
	literaryWorks: geometriasDelDesveloRawCollection.literaryWorks.map((work, index) =>
		index === 0 ? { ...work, totalReadingTime: null } : work,
	),
};
