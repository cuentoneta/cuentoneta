import type { CollectionBySlugQueryResult, CollectionsQueryResult } from '@sanity-types';

import { ambarYCenizaRawCollection } from './onoff/collection/ambar-y-ceniza.collection.raw.mock';
import { bitacoraDelInsomnioRawCollection } from './onoff/collection/bitacora-del-insomnio.collection.raw.mock';
import { onoffRawCollectionTeasersMock as generatedTeasers } from './onoff/collection/collection-teasers.raw.mock';
import { cuadernosDelMeridienRawCollection } from './onoff/collection/cuadernos-del-meridien.collection.raw.mock';
import { geometriasDelDesveloRawCollection } from './onoff/collection/geometrias-del-desvelo.collection.raw.mock';
import { inventarioDeLasPasionesRawCollection } from './onoff/collection/inventario-de-las-pasiones.collection.raw.mock';
import { reyesDeUtileriaRawCollection } from './onoff/collection/reyes-de-utileria.collection.raw.mock';

type RawCollection = NonNullable<CollectionBySlugQueryResult>;

export const onoffRawCollectionsMock: RawCollection[] = [
	geometriasDelDesveloRawCollection,
	inventarioDeLasPasionesRawCollection,
	ambarYCenizaRawCollection,
	cuadernosDelMeridienRawCollection,
	bitacoraDelInsomnioRawCollection,
	reyesDeUtileriaRawCollection,
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

export const onoffRawCollectionTeasersWithFeaturedImage: CollectionsQueryResult = onoffRawCollectionTeasersMock.filter(
	(teaser) => teaser.featuredImage !== null,
);

export const onoffRawCollectionTeasersWithoutFeaturedImage: CollectionsQueryResult =
	onoffRawCollectionTeasersMock.filter((teaser) => teaser.featuredImage === null);

// La prosa cruda con un enlace Markdown propio, que es lo que distingue las dos vistas: el teaser lo
// descarta y la vista completa lo conserva. El predicado mira el crudo porque acá el enlace todavía
// es Markdown; después del saneado, el teaser ya no lo tiene con qué reconocerse.
const carriesMarkdownLink = (description: string) => /\]\(https?:\/\//.test(description);

export const onoffRawCollectionsWithLinkedDescription: RawCollection[] = onoffRawCollectionsMock.filter((collection) =>
	carriesMarkdownLink(collection.description),
);

export const onoffRawCollectionTeasersWithLinkedDescription: CollectionsQueryResult =
	onoffRawCollectionTeasersMock.filter((teaser) => carriesMarkdownLink(teaser.description));

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

// Una obra a la que el backfill todavía no le calculó su tiempo de lectura total. Sin ese dato no hay
// nada que mostrar en la tarjeta, y el ACL la trata como mal curada.
export const unbackfilledWorkRawCollection: RawCollection = {
	...geometriasDelDesveloRawCollection,
	literaryWorks: geometriasDelDesveloRawCollection.literaryWorks.map((work, index) =>
		index === 0 ? { ...work, totalReadingTime: null } : work,
	),
};
