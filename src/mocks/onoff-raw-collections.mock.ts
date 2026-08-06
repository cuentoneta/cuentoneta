import type { CollectionsQueryResult } from '@sanity-types';

import { geometriasDelDesveloRawCollection } from './onoff/collection/geometrias-del-desvelo.collection.raw.mock';
import { inventarioDeLasPasionesRawCollection } from './onoff/collection/inventario-de-las-pasiones.collection.raw.mock';
import type { RawCollection } from './onoff/collection/raw-collection.projection';

type RawCollectionTeaser = CollectionsQueryResult[number];

export const onoffRawCollectionsMock: RawCollection[] = [
	geometriasDelDesveloRawCollection,
	inventarioDeLasPasionesRawCollection,
];

// El teaser se deriva de la colección completa en vez de escribirse aparte: así las dos no se pueden
// desincronizar, que es el mismo criterio con el que el corpus de dominio proyecta sus teasers.
function toRawTeaser(collection: RawCollection): RawCollectionTeaser {
	const { literaryWorks, ...rest } = collection;
	return {
		...rest,
		count: literaryWorks.length,
		literaryWorkCoverImages: literaryWorks.slice(0, 3).map((work) => work.coverImage),
	};
}

export const onoffRawCollectionTeasersMock: RawCollectionTeaser[] = onoffRawCollectionsMock.map(toRawTeaser);

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
