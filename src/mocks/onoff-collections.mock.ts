import { createCollectionTeaser, type Collection, type CollectionTeaser } from '@models/collection.model';

// Import permitido: la restricción de ruta exime a `src/mocks/**`.
import {
	ambarYCenizaCollectionMock,
	bitacoraDelInsomnioCollectionMock,
	cuadernosDelMeridienCollectionMock,
	geometriasDelDesveloCollectionMock,
	inventarioDeLasPasionesCollectionMock,
	reyesDeUtileriaCollectionMock,
	toTeaser,
} from './onoff/collection/collections.mock';

export const onoffCollectionsMock: Collection[] = [
	geometriasDelDesveloCollectionMock,
	inventarioDeLasPasionesCollectionMock,
	ambarYCenizaCollectionMock,
	cuadernosDelMeridienCollectionMock,
	bitacoraDelInsomnioCollectionMock,
	reyesDeUtileriaCollectionMock,
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

export const onoffCollectionsWithoutTagsMock: Collection[] = onoffCollectionsMock.filter(
	(collection) => collection.tags.length === 0,
);

export const onoffCollectionsWithSingleTagMock: Collection[] = onoffCollectionsMock.filter(
	(collection) => collection.tags.length === 1,
);

export const onoffCollectionsWithMultipleTagsMock: Collection[] = onoffCollectionsMock.filter(
	(collection) => collection.tags.length > 1,
);

// Criterio de curaduría: a partir de este largo un título deja de entrar en una línea en la caja
// angosta donde se pinta el teaser navegable, que es lo que su consumidor necesita ver recortado.
const LONG_TITLE_LENGTH = 40;

export const onoffCollectionsWithLongTitlesMock: Collection[] = onoffCollectionsMock.filter(
	(collection) => collection.title.length >= LONG_TITLE_LENGTH,
);

// La prosa con un enlace propio se predica sobre la colección y no sobre el teaser: el teaser sale sin
// enlaces por diseño, así que el predicado sobre él no encontraría ninguna.
export const onoffCollectionsWithLinkedDescriptionMock: Collection[] = onoffCollectionsMock.filter((collection) =>
	collection.description.includes('<a '),
);

// Un título que no empieza con un carácter ASCII es lo que distingue el orden con colación española del
// orden por punto de código, donde queda detrás de todo el alfabeto.
const LAST_ASCII_CODE_POINT = 127;

export const onoffCollectionsWithNonAsciiInitialMock: Collection[] = onoffCollectionsMock.filter(
	(collection) => collection.title.charCodeAt(0) > LAST_ASCII_CODE_POINT,
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

export const onoffCollectionTeasersWithoutTagsMock: CollectionTeaser[] = onoffCollectionsWithoutTagsMock.map(toTeaser);

export const onoffCollectionTeasersWithSingleTagMock: CollectionTeaser[] =
	onoffCollectionsWithSingleTagMock.map(toTeaser);

export const onoffCollectionTeasersWithMultipleTagsMock: CollectionTeaser[] =
	onoffCollectionsWithMultipleTagsMock.map(toTeaser);

export const onoffCollectionTeasersWithLongTitlesMock: CollectionTeaser[] =
	onoffCollectionsWithLongTitlesMock.map(toTeaser);

export const onoffCollectionTeasersWithLinkedDescriptionMock: CollectionTeaser[] =
	onoffCollectionsWithLinkedDescriptionMock.map(toTeaser);

export const onoffCollectionTeasersWithNonAsciiInitialMock: CollectionTeaser[] =
	onoffCollectionsWithNonAsciiInitialMock.map(toTeaser);

// El contador de la tarjeta distingue "1 obra" de "N obras", y ninguna colección del elenco cae de ese
// lado: las que se curaron agrupan varias obras. El escenario existe para que quien renderiza esa rama
// tenga con qué probarla, y por eso no sale de un documento como el resto del corpus.
// Sale de una colección con portada editorial propia, no de la primera del agregador: una colección de
// una obra no podría exhibir el abanico de tres portadas que la rama `sample` deriva de las suyas.
export const singleLiteraryWorkCollectionTeaserMock: CollectionTeaser = createCollectionTeaser({
	...onoffCollectionTeasersWithRepresentativeImageryMock[0],
	count: 1,
});
