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

// Las cuatro colecciones siguientes comparten obras con las dos de arriba y entre sí. Es fiel al
// dominio: una obra entra en cada colección por el ángulo de curaduría que su prosa nombra, y ningún
// trío se repite, así que los abanicos de portadas se distinguen entre sí.
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

export const ambarYCenizaCollectionMock: Collection = createCollection({
	_id: 'onoff-collection-ambar-y-ceniza',
	slug: 'ambar-y-ceniza',
	title: 'Ámbar y ceniza',
	description: markdownToSanitizedHtml(createMarkdown(ambarYCenizaDescriptionMd)),
	imagery: sampleFrom(ambarYCenizaWorks),
	tags: [tragediaTagMock, dramaHistoricoTagMock],
	config: { showAuthors: false },
	mediaSources: [],
	literaryWorks: ambarYCenizaWorks,
});

/** La única colección cuya prosa trae un enlace propio, que el teaser sanea y la vista completa conserva. */
export const cuadernosDelMeridienCollectionMock: Collection = createCollection({
	_id: 'onoff-collection-cuadernos-del-meridien',
	slug: 'cuadernos-del-meridien',
	title: 'Cuadernos del Méridien: los años de taller y las obras corregidas a posteriori',
	description: markdownToSanitizedHtml(createMarkdown(cuadernosDelMeridienDescriptionMd)),
	imagery: sampleFrom(cuadernosDelMeridienWorks),
	tags: [colaborativaTagMock, ensayoTagMock, metaficcionTagMock],
	config: { showAuthors: true },
	mediaSources: [],
	literaryWorks: cuadernosDelMeridienWorks,
});

/** Colección sin etiquetas: su documento omite `tags` y `config`, y las queries resuelven los defaults. */
export const bitacoraDelInsomnioCollectionMock: Collection = createCollection({
	_id: 'onoff-collection-bitacora-del-insomnio',
	slug: 'bitacora-del-insomnio',
	title: 'Bitácora del insomnio',
	description: markdownToSanitizedHtml(createMarkdown(bitacoraDelInsomnioDescriptionMd)),
	imagery: sampleFrom(bitacoraDelInsomnioWorks),
	tags: [],
	config: { showAuthors: false },
	mediaSources: [],
	literaryWorks: bitacoraDelInsomnioWorks,
});

export const reyesDeUtileriaCollectionMock: Collection = createCollection({
	_id: 'onoff-collection-reyes-de-utileria',
	slug: 'reyes-de-utileria',
	title: 'Reyes de utilería',
	description: markdownToSanitizedHtml(createMarkdown(reyesDeUtileriaDescriptionMd)),
	imagery: sampleFrom(reyesDeUtileriaWorks),
	tags: [teatroTagMock, tragediaTagMock],
	config: { showAuthors: true },
	mediaSources: [],
	literaryWorks: reyesDeUtileriaWorks,
});

// La prosa cruda de cada colección, indexada por slug, porque el teaser la sanea con un pipeline
// distinto del que ya aplicó la vista completa y necesita partir del Markdown original.
const collectionDescriptionsBySlug = new Map<string, string>([
	['geometrias-del-desvelo', geometriasDescriptionMd],
	['inventario-de-las-pasiones', inventarioDescriptionMd],
	['ambar-y-ceniza', ambarYCenizaDescriptionMd],
	['cuadernos-del-meridien', cuadernosDelMeridienDescriptionMd],
	['bitacora-del-insomnio', bitacoraDelInsomnioDescriptionMd],
	['reyes-de-utileria', reyesDeUtileriaDescriptionMd],
]);

// Pasa por la factory del teaser, igual que el repository: si el corpus lo armara por spread, sería
// el único productor que se saltea las invariantes que esa factory existe para hacer cumplir.
//
// La descripción se rehace desde el Markdown en vez de copiarse de la colección: el ACL sanea el
// teaser sin enlaces y la vista completa con ellos, así que copiarla haría coincidir las dos caras
// por construcción y el corpus dejaría de tener con qué probar a quien las distingue.
export function toTeaser(collection: Collection): CollectionTeaser {
	const description = collectionDescriptionsBySlug.get(collection.slug);
	if (!description) {
		throw new Error(`Corpus incompleto: falta la prosa cruda de la colección "${collection.slug}"`);
	}

	return createCollectionTeaser({
		_id: collection._id,
		slug: collection.slug,
		title: collection.title,
		description: markdownToLinklessSanitizedHtml(createMarkdown(description)),
		imagery: collection.imagery,
		tags: collection.tags,
		config: collection.config,
		mediaSources: collection.mediaSources,
		count: collection.count,
	});
}
