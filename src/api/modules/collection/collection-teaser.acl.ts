import type { CollectionBySlugQueryResult, CollectionsQueryResult, LandingPageContentQueryResult } from '@sanity-types';
import { createCollectionTeaser, type CollectionImagery, type CollectionTeaser } from '@models/collection.model';
import { createMarkdown, type Markdown } from '@models/markdown.model';
import type { SanitizedHtml } from '@models/sanitized-html.model';
import { markdownToLinklessSanitizedHtml } from '@utils/markdown-pipeline.utils';
import { mapTags, urlFor } from '../../_utils/functions';
import { mapMediaSources } from '../../_utils/media-sources.functions';
import { MalformedCollectionError } from './collection.errors';

// El ensamblado del teaser de colección es propiedad de este módulo y no del repository que hoy lo
// produce, ni una primitiva genérica de `_utils/`: monta un agregado y hace cumplir sus invariantes.
// `resolveCollectionImagery` codifica una de ellas —sin portada editorial hacen falta exactamente
// tres portadas de muestra—, y una segunda definición haría que la misma colección se construyera por
// un camino y fallara por el otro.
//
// El origen es una unión de proyecciones, no una sola: el catálogo de colecciones y la página de
// inicio dereferencian colecciones cada una por su lado, y `defineQuery` exige literales, así que la
// proyección se repite. El seguro contra la deriva es el tipo — si una diverge, la unión deja de
// aceptar el mapeo y el typecheck lo denuncia.
type SanityCollectionTeaserSource =
	CollectionsQueryResult[number] | NonNullable<LandingPageContentQueryResult>['collections'][number];
type SanityFeaturedImage = NonNullable<CollectionBySlugQueryResult>['featuredImage'];

export function mapSanityCollectionTeaser(raw: SanityCollectionTeaserSource): CollectionTeaser {
	return createCollectionTeaser({
		...mapSharedCollectionFields(raw, markdownToLinklessSanitizedHtml),
		imagery: resolveCollectionImagery(
			raw.slug,
			raw.featuredImage,
			raw.literaryWorkCoverImages.map((cover) => (cover ? urlFor(cover) : '')),
		),
		// Cero cuando la colección no tiene obras, que es el caso que la factory rechaza.
		count: raw.count,
	});
}

// Lo que las dos vistas de colección mapean igual. La descripción va sin default: el vacío tiene que
// lanzar y quedar envuelto, no colarse como una colección sin prosa.
//
// Cada vista elige su pipeline: el teaser sin enlaces, la vista completa con ellos. Ahí la prosa no
// se pinta dentro de nada, así que el enlace es legítimo.
export function mapSharedCollectionFields(
	raw: NonNullable<CollectionBySlugQueryResult> | SanityCollectionTeaserSource,
	toSanitizedHtml: (markdown: Markdown) => SanitizedHtml,
) {
	return {
		_id: raw._id,
		slug: raw.slug,
		title: raw.title,
		description: toSanitizedHtml(createMarkdown(raw.description)),
		tags: mapTags(raw.tags),
		config: { showAuthors: raw.config.showAuthors },
		mediaSources: mapMediaSources(raw.mediaSources),
	};
}

// Las dos vistas le pasan las portadas de las **mismas tres** obras, para que una colección no pueda
// construirse por un camino y fallar por el otro. Un abanico incompleto lanza en vez de rellenarse:
// una portada vacía llega a la interfaz como una imagen rota.
export function resolveCollectionImagery(
	slug: string,
	featuredImage: SanityFeaturedImage,
	coverUrls: string[],
): CollectionImagery {
	const image = featuredImage ? urlFor(featuredImage) : '';
	if (image !== '') {
		return { kind: 'representative', image };
	}
	const [first, second, third] = coverUrls.filter((url) => url !== '');
	if (first === undefined || second === undefined || third === undefined) {
		throw new MalformedCollectionError(slug);
	}
	return { kind: 'sample', images: [first, second, third] };
}
