import {
	createCollection,
	createCollectionTeaser,
	type Collection,
	type CollectionImagery,
	type CollectionTeaser,
} from '@models/collection.model';
import type { LiteraryWorkTeaser } from '@models/literary-work.model';
import { createMarkdown } from '@models/markdown.model';
import { markdownToLinklessSanitizedHtml, markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';

import { onoffImageAssets } from '../../onoff-image-assets.mock';
import {
	colaborativaTagMock,
	dramaHistoricoTagMock,
	ensayoTagMock,
	metaficcionTagMock,
	teatroTagMock,
	tragediaTagMock,
} from '../../onoff-tags.mock';
import { geometriasDelDesveloMediaMock } from '../media/geometrias-del-desvelo.media.mock';
import {
	elOdioLiteraryWorkTeaserMock,
	elTratadoDeLosPlaceresLiteraryWorkTeaserMock,
	geometriaLiteraryWorkTeaserMock,
	lasDosAntorchasLiteraryWorkTeaserMock,
	lasEscalerasLiteraryWorkTeaserMock,
	losPeldanosLiteraryWorkTeaserMock,
	neronLiteraryWorkTeaserMock,
	palacioNueveFronterasLiteraryWorkTeaserMock,
} from '../literary-work/literary-work-teasers.mock';
import ambarYCenizaDescriptionMd from './ambar-y-ceniza.collection.md?raw';
import bitacoraDelInsomnioDescriptionMd from './bitacora-del-insomnio.collection.md?raw';
import cuadernosDelMeridienDescriptionMd from './cuadernos-del-meridien.collection.md?raw';
import geometriasDescriptionMd from './geometrias-del-desvelo.collection.md?raw';
import inventarioDescriptionMd from './inventario-de-las-pasiones.collection.md?raw';
import reyesDeUtileriaDescriptionMd from './reyes-de-utileria.collection.md?raw';

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

// Las colecciones siguientes comparten obras con las dos de arriba y entre sí. Es fiel al dominio: una
// obra entra en cada colección por el ángulo de curaduría que su prosa nombra. Ningún par de
// colecciones repite el mismo conjunto, que es de lo que depende que los abanicos de portadas se
// distingan entre sí; lo verifica el spec del agregador.
const ambarYCenizaWorks = [
	lasDosAntorchasLiteraryWorkTeaserMock,
	neronLiteraryWorkTeaserMock,
	elOdioLiteraryWorkTeaserMock,
] as const;

const cuadernosDelMeridienWorks = [
	palacioNueveFronterasLiteraryWorkTeaserMock,
	elTratadoDeLosPlaceresLiteraryWorkTeaserMock,
	lasEscalerasLiteraryWorkTeaserMock,
] as const;

const bitacoraDelInsomnioWorks = [
	geometriaLiteraryWorkTeaserMock,
	elOdioLiteraryWorkTeaserMock,
	palacioNueveFronterasLiteraryWorkTeaserMock,
] as const;

const reyesDeUtileriaWorks = [
	neronLiteraryWorkTeaserMock,
	palacioNueveFronterasLiteraryWorkTeaserMock,
	losPeldanosLiteraryWorkTeaserMock,
] as const;

// Las tres portadas salen de las propias obras, no escritas a mano: es lo que el mapper deriva
// cuando la colección no tiene portada editorial. La firma exige exactamente tres para que el largo
// sea una garantía del tipo y no un fallback que tape en silencio un corpus mal curado.
function sampleFrom(works: readonly [LiteraryWorkTeaser, LiteraryWorkTeaser, LiteraryWorkTeaser]): CollectionImagery {
	const [first, second, third] = works;
	return { kind: 'sample', images: [first.coverImage, second.coverImage, third.coverImage] };
}

type CollectionFromOptions = Omit<Parameters<typeof createCollection>[0], 'description'> & { descriptionMd: string };

const rawDescriptionsBySlug = new Map<string, string>();

/**
 * Construye la colección y **registra su prosa cruda**, que es de donde `toTeaser` rehace la
 * descripción del teaser. Las dos caras se toman del mismo Markdown por construcción: una colección no
 * puede quedarse sin la suya, porque la registra el mismo llamado que la crea.
 */
function collectionFrom({ descriptionMd, ...options }: CollectionFromOptions): Collection {
	rawDescriptionsBySlug.set(options.slug, descriptionMd);
	return createCollection({ ...options, description: markdownToSanitizedHtml(createMarkdown(descriptionMd)) });
}

/** Colección con portada editorial propia — la rama `representative` de `imagery`. */
export const geometriasDelDesveloCollectionMock: Collection = collectionFrom({
	_id: 'onoff-collection-geometrias-del-desvelo',
	slug: 'geometrias-del-desvelo',
	title: 'Geometrías del desvelo',
	descriptionMd: geometriasDescriptionMd,
	imagery: { kind: 'representative', image: onoffImageAssets.geometriasDelDesveloCover.path },
	tags: [colaborativaTagMock],
	config: { showAuthors: true },
	mediaSources: geometriasDelDesveloMediaMock,
	literaryWorks: geometriasWorks,
});

/** Colección sin portada propia — la rama `sample`, derivada de las portadas de sus obras. */
export const inventarioDeLasPasionesCollectionMock: Collection = collectionFrom({
	_id: 'onoff-collection-inventario-de-las-pasiones',
	slug: 'inventario-de-las-pasiones',
	title: 'El inventario de las pasiones',
	descriptionMd: inventarioDescriptionMd,
	imagery: sampleFrom(inventarioWorks),
	tags: [colaborativaTagMock],
	config: { showAuthors: false },
	mediaSources: [],
	literaryWorks: inventarioWorks,
});

export const ambarYCenizaCollectionMock: Collection = collectionFrom({
	_id: 'onoff-collection-ambar-y-ceniza',
	slug: 'ambar-y-ceniza',
	title: 'Ámbar y ceniza',
	descriptionMd: ambarYCenizaDescriptionMd,
	imagery: sampleFrom(ambarYCenizaWorks),
	tags: [tragediaTagMock, dramaHistoricoTagMock, ensayoTagMock],
	config: { showAuthors: false },
	mediaSources: [],
	literaryWorks: ambarYCenizaWorks,
});

/** Su prosa trae un enlace propio, que el teaser descarta y la vista completa conserva. */
export const cuadernosDelMeridienCollectionMock: Collection = collectionFrom({
	_id: 'onoff-collection-cuadernos-del-meridien',
	slug: 'cuadernos-del-meridien',
	title: 'Cuadernos del Méridien: los años de taller y las obras corregidas a posteriori',
	descriptionMd: cuadernosDelMeridienDescriptionMd,
	imagery: sampleFrom(cuadernosDelMeridienWorks),
	tags: [colaborativaTagMock, ensayoTagMock, metaficcionTagMock],
	config: { showAuthors: true },
	mediaSources: [],
	literaryWorks: cuadernosDelMeridienWorks,
});

/** Colección sin etiquetas: su documento omite `tags` y `config`, y las queries resuelven los defaults. */
export const bitacoraDelInsomnioCollectionMock: Collection = collectionFrom({
	_id: 'onoff-collection-bitacora-del-insomnio',
	slug: 'bitacora-del-insomnio',
	title: 'Bitácora del insomnio',
	descriptionMd: bitacoraDelInsomnioDescriptionMd,
	imagery: sampleFrom(bitacoraDelInsomnioWorks),
	tags: [],
	config: { showAuthors: false },
	mediaSources: [],
	literaryWorks: bitacoraDelInsomnioWorks,
});

export const reyesDeUtileriaCollectionMock: Collection = collectionFrom({
	_id: 'onoff-collection-reyes-de-utileria',
	slug: 'reyes-de-utileria',
	title: 'Reyes de utilería',
	descriptionMd: reyesDeUtileriaDescriptionMd,
	imagery: sampleFrom(reyesDeUtileriaWorks),
	tags: [teatroTagMock, tragediaTagMock],
	config: { showAuthors: true },
	mediaSources: [],
	literaryWorks: reyesDeUtileriaWorks,
});

// Pasa por la factory del teaser, igual que el repository: si el corpus lo armara por spread, sería
// el único productor que se saltea las invariantes que esa factory existe para hacer cumplir.
//
// La descripción se rehace desde el Markdown en vez de copiarse de la colección: el ACL sanea el
// teaser sin enlaces y la vista completa con ellos, así que copiarla haría coincidir las dos caras
// por construcción y el corpus dejaría de tener con qué probar a quien las distingue.
export function toTeaser(collection: Collection): CollectionTeaser {
	const descriptionMd = rawDescriptionsBySlug.get(collection.slug);
	if (!descriptionMd) {
		throw new Error(`Collection ajena al corpus: "${collection.slug}" no se construyó con collectionFrom`);
	}

	return createCollectionTeaser({
		_id: collection._id,
		slug: collection.slug,
		title: collection.title,
		description: markdownToLinklessSanitizedHtml(createMarkdown(descriptionMd)),
		imagery: collection.imagery,
		tags: collection.tags,
		config: collection.config,
		mediaSources: collection.mediaSources,
		count: collection.count,
	});
}
