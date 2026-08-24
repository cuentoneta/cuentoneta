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

// El canon no ejercita el caso: hace falta un escenario cuyo Markdown traiga enlaces para poder
// afirmar qué hace cada vista con ellos.
const linkedDescriptionMd = 'Una colección con [un enlace propio](https://www.cuentoneta.ar/about) en la prosa.';

export const linkedDescriptionRawCollection: RawCollection = {
	...geometriasDelDesveloRawCollection,
	description: linkedDescriptionMd,
};

export const linkedDescriptionRawCollectionTeasers: CollectionsQueryResult = generatedTeasers.map((teaser) => ({
	...teaser,
	description: linkedDescriptionMd,
}));

export const sectionlessWorkRawCollection: RawCollection = {
	...geometriasDelDesveloRawCollection,
	literaryWorks: geometriasDelDesveloRawCollection.literaryWorks.map((work, index) =>
		index === 0 ? { ...work, excerpt: [], sectionCount: 0 } : work,
	),
};

// Una obra a la que el backfill todavía no le calculó su tiempo de lectura total. Sin ese dato no hay
// nada que mostrar en la tarjeta, y el ACL la trata como mal curada.
export const unbackfilledWorkRawCollection: RawCollection = {
	...geometriasDelDesveloRawCollection,
	literaryWorks: geometriasDelDesveloRawCollection.literaryWorks.map((work, index) =>
		index === 0 ? { ...work, totalReadingTime: null } : work,
	),
};
