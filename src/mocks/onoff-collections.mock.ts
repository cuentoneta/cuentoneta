import {
	createCollection,
	createCollectionTeaser,
	type Collection,
	type CollectionImagery,
	type CollectionTeaser,
} from '@models/collection.model';
import type { LiteraryWorkTeaser } from '@models/literary-work.model';
import { createMarkdown } from '@models/markdown.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';

import { onoffImageAssets } from './onoff-image-assets.mock';
import { colaborativaTagMock } from './onoff-tags.mock';
import { geometriasDelDesveloMediaMock } from './onoff/media/geometrias-del-desvelo.media.mock';
import geometriasDescriptionMd from './onoff/collection/geometrias-del-desvelo.collection.md?raw';
import inventarioDescriptionMd from './onoff/collection/inventario-de-las-pasiones.collection.md?raw';
import {
	elOdioLiteraryWorkTeaserMock,
	elTratadoDeLosPlaceresLiteraryWorkTeaserMock,
	geometriaLiteraryWorkTeaserMock,
	lasDosAntorchasLiteraryWorkTeaserMock,
	lasEscalerasLiteraryWorkTeaserMock,
	losPeldanosLiteraryWorkTeaserMock,
} from './onoff-literary-work-teasers.mock';

// Cada colección se cura con las obras que su propia prosa nombra, no con un corte arbitrario del
// agregador: así las dos son distinguibles por contenido y no solo por la rama de `imagery`.
const geometriasWorks = [
	geometriaLiteraryWorkTeaserMock,
	losPeldanosLiteraryWorkTeaserMock,
	lasEscalerasLiteraryWorkTeaserMock,
] as const;

const inventarioWorks = [
	elTratadoDeLosPlaceresLiteraryWorkTeaserMock,
	elOdioLiteraryWorkTeaserMock,
	lasDosAntorchasLiteraryWorkTeaserMock,
] as const;

// Las tres portadas salen de las propias obras, no escritas a mano: es lo que el mapper deriva
// cuando la colección no tiene portada editorial. La firma exige exactamente tres para que el largo
// sea una garantía del tipo y no un fallback que tape en silencio un corpus mal curado.
function sampleFrom(works: readonly [LiteraryWorkTeaser, LiteraryWorkTeaser, LiteraryWorkTeaser]): CollectionImagery {
	const [first, second, third] = works;
	return { kind: 'sample', images: [first.coverImage, second.coverImage, third.coverImage] };
}

/** Colección con portada editorial propia — la rama `representative` de `imagery`. */
export const geometriasDelDesveloCollectionMock: Collection = createCollection({
	_id: 'onoff-collection-geometrias-del-desvelo',
	slug: 'geometrias-del-desvelo',
	title: 'Geometrías del desvelo',
	description: markdownToSanitizedHtml(createMarkdown(geometriasDescriptionMd)),
	imagery: { kind: 'representative', image: onoffImageAssets.geometriasDelDesveloCover.path },
	tags: [colaborativaTagMock],
	config: { showAuthors: true },
	mediaSources: geometriasDelDesveloMediaMock,
	literaryWorks: geometriasWorks,
});

/** Colección sin portada propia — la rama `sample`, derivada de las portadas de sus obras. */
export const inventarioDeLasPasionesCollectionMock: Collection = createCollection({
	_id: 'onoff-collection-inventario-de-las-pasiones',
	slug: 'inventario-de-las-pasiones',
	title: 'El inventario de las pasiones',
	description: markdownToSanitizedHtml(createMarkdown(inventarioDescriptionMd)),
	imagery: sampleFrom(inventarioWorks),
	tags: [colaborativaTagMock],
	config: { showAuthors: false },
	mediaSources: [],
	literaryWorks: inventarioWorks,
});

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

export const onoffCollectionsWithMediaSourcesMock: Collection[] = onoffCollectionsMock.filter(
	(collection) => collection.mediaSources.length > 0,
);

// Pasa por la factory del teaser, igual que el repository: si el corpus lo armara por spread, sería
// el único productor que se saltea las invariantes que esa factory existe para hacer cumplir.
function toTeaser(collection: Collection): CollectionTeaser {
	return createCollectionTeaser({
		_id: collection._id,
		slug: collection.slug,
		title: collection.title,
		description: collection.description,
		imagery: collection.imagery,
		tags: collection.tags,
		config: collection.config,
		mediaSources: collection.mediaSources,
		count: collection.count,
	});
}

export const geometriasDelDesveloCollectionTeaserMock: CollectionTeaser = toTeaser(geometriasDelDesveloCollectionMock);
export const inventarioDeLasPasionesCollectionTeaserMock: CollectionTeaser = toTeaser(
	inventarioDeLasPasionesCollectionMock,
);

export const onoffCollectionTeasersMock: CollectionTeaser[] = onoffCollectionsMock.map(toTeaser);
