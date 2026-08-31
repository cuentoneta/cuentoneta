import { createCollectionTeaser, type Collection, type CollectionTeaser } from '@models/collection.model';

// Las colecciones y su proyección a teaser viven bajo `onoff/collection/`, junto a la prosa de la que
// derivan: es la ruta que la restricción de imports alcanza, y este agregador es uno de los
// consumidores que la convención sí admite.
import {
	geometriasDelDesveloCollectionMock,
	inventarioDeLasPasionesCollectionMock,
	toTeaser,
} from './onoff/collection/collections.mock';

export const onoffCollectionsMock: Collection[] = [
	geometriasDelDesveloCollectionMock,
	inventarioDeLasPasionesCollectionMock,
];

// Selectores por capacidad: un consumidor que necesita una rama concreta de `imagery` la pide por lo
// que hace falta, no por el nombre de una colección puntual, y filtrarlos evita que sean listas
// paralelas que se desincronicen del agregador.
export const onoffCollectionsWithRepresentativeImageryMock: Collection[] = onoffCollectionsMock.filter(
	(collection) => collection.imagery.kind === 'representative',
);

export const onoffCollectionsWithSampleImageryMock: Collection[] = onoffCollectionsMock.filter(
	(collection) => collection.imagery.kind === 'sample',
);

export const onoffCollectionsShowingAuthorsMock: Collection[] = onoffCollectionsMock.filter(
	(collection) => collection.config.showAuthors,
);

export const onoffCollectionsHidingAuthorsMock: Collection[] = onoffCollectionsMock.filter(
	(collection) => !collection.config.showAuthors,
);

export const onoffCollectionsWithMediaSourcesMock: Collection[] = onoffCollectionsMock.filter(
	(collection) => collection.mediaSources.length > 0,
);

export const onoffCollectionsWithTagsMock: Collection[] = onoffCollectionsMock.filter(
	(collection) => collection.tags.length > 0,
);

export const onoffCollectionTeasersMock: CollectionTeaser[] = onoffCollectionsMock.map(toTeaser);

// Cada selector de teaser proyecta el de colección homónimo en vez de repetir su predicado: la
// capacidad queda definida en un solo lugar, y las dos vistas no pueden divergir sobre qué colección
// la cumple.
export const onoffCollectionTeasersWithRepresentativeImageryMock: CollectionTeaser[] =
	onoffCollectionsWithRepresentativeImageryMock.map(toTeaser);

export const onoffCollectionTeasersWithSampleImageryMock: CollectionTeaser[] =
	onoffCollectionsWithSampleImageryMock.map(toTeaser);

export const onoffCollectionTeasersWithTagsMock: CollectionTeaser[] = onoffCollectionsWithTagsMock.map(toTeaser);

// Los teasers extra se derivan del primero del canon y pasan uno a uno por la factory del teaser:
// el agregado está congelado, así que armarlos por spread saltearía las invariantes que esa
// factory existe para hacer cumplir.
//
// TODO(#2333): tomar colecciones reales del corpus en vez de repetir una.
// Al salir todos del mismo canónico comparten portada, prosa, etiqueta y conteo de obras, y sólo se
// distinguen por un título correlativo. Una grilla así se ve homogénea de un modo que ningún catálogo
// real es: no muestra portadas dispares, ni descripciones de largo distinto, ni el recorte del título.
export function onoffCollectionTeasersOfLength(count: number): CollectionTeaser[] {
	const [base] = onoffCollectionTeasersMock;
	return Array.from({ length: count }, (_, index) =>
		createCollectionTeaser({
			_id: `${base._id}-${index + 1}`,
			slug: `${base.slug}-${index + 1}`,
			title: `Colección ${index + 1}`,
			description: base.description,
			imagery: base.imagery,
			tags: base.tags,
			config: base.config,
			mediaSources: base.mediaSources,
			count: base.count,
		}),
	);
}
