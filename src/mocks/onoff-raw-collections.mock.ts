import type { CollectionBySlugQueryResult, CollectionsQueryResult } from '@sanity-types';

import geometriasDescriptionMd from './onoff/geometrias-del-desvelo.collection.md?raw';
import inventarioDescriptionMd from './onoff/inventario-de-las-pasiones.collection.md?raw';
import { onoffRawLiteraryWorksMock } from './onoff-raw-literary-works.mock';

type RawCollection = NonNullable<CollectionBySlugQueryResult>;
type RawCollectionWork = RawCollection['literaryWorks'][number];
type RawCollectionTeaser = CollectionsQueryResult[number];
type RawLiteraryWork = (typeof onoffRawLiteraryWorksMock)[number];

// Las dos colecciones se definen acá y no en un archivo por slug —como sí hacen las obras— porque no
// son literales curados: se derivan del canon crudo de obras. La contraparte de dominio se organiza
// igual, por la misma razón.

// La proyección de la query recorta la obra: se queda con la metadata de tarjeta, achica los autores
// al shape de teaser (sin biografía, recursos ni etiquetas) y trae una sola sección de apertura.
function toCollectionWork(work: RawLiteraryWork): RawCollectionWork {
	return {
		_id: work._id,
		slug: work.slug,
		title: work.title,
		coverImage: work.coverImage,
		totalReadingTime: work.totalReadingTime,
		sectionCount: work.content.length,
		tags: work.tags,
		mediaSources: work.mediaSources,
		authors: work.authors.map(({ _id, slug, name, image, nationality, bornOn, bornOnYear, diedOn, diedOnYear }) => ({
			_id,
			slug,
			name,
			image,
			nationality,
			bornOn,
			bornOnYear,
			diedOn,
			diedOnYear,
		})),
		teaserSection: work.content.slice(0, 1),
	};
}

function workBySlug(slug: string): RawLiteraryWork {
	const work = onoffRawLiteraryWorksMock.find((candidate) => candidate.slug === slug);
	if (!work) {
		throw new Error(`El canon crudo de obras no tiene "${slug}"`);
	}
	return work;
}

function collectionWorks(...slugs: string[]): RawCollectionWork[] {
	return slugs.map((slug) => toCollectionWork(workBySlug(slug)));
}

const geometriasFeaturedImage: RawCollection['featuredImage'] = {
	_type: 'image',
	asset: { _ref: 'image-6efd3e53eec8dfab23e1c0109027be9f58a01f8c-1200x630-png', _type: 'reference' },
};

// Rama `representative` de imagery: la colección trae su propia portada editorial.
export const geometriasDelDesveloRawCollection: RawCollection = {
	_id: 'onoff-collection-geometrias-del-desvelo',
	slug: 'geometrias-del-desvelo',
	title: 'Geometrías del desvelo',
	description: geometriasDescriptionMd,
	featuredImage: geometriasFeaturedImage,
	config: { showAuthors: true },
	tags: [],
	mediaSources: [],
	literaryWorks: collectionWorks('geometria', 'los-peldanos', 'las-escaleras'),
};

// Rama `sample` de imagery: sin portada propia, el abanico sale de las portadas de sus obras.
export const inventarioDeLasPasionesRawCollection: RawCollection = {
	_id: 'onoff-collection-inventario-de-las-pasiones',
	slug: 'inventario-de-las-pasiones',
	title: 'El inventario de las pasiones',
	description: inventarioDescriptionMd,
	featuredImage: null,
	config: { showAuthors: false },
	tags: [],
	mediaSources: [],
	literaryWorks: collectionWorks('el-tratado-de-los-placeres', 'el-odio', 'las-dos-antorchas'),
};

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
