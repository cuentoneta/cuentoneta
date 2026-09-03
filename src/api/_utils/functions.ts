// Conector a Sanity
import { client } from '../_helpers/sanity-connector';

// Sanity utils
import type { SanityImageSource } from '@sanity/image-url';
import { createImageUrlBuilder } from '@sanity/image-url';

// Modelos
import type { Author, AuthorProfile, AuthorTeaser } from '@models/author.model';
import type { ContentCampaign } from '@models/content-campaign.model';
import { viewportElementSizes } from '@models/content-campaign.model';
import type { Resource } from '@models/resource.model';
import type { Tag } from '@models/tag.model';
import { createMarkdown } from '@models/markdown.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';

// Tipos de Sanity
import type {
	AuthorBySlugQueryResult,
	AuthorsQueryResult,
	CollectionBySlugQueryResult,
	LandingPageContentQueryResult,
	LiteraryWorkBySlugQueryResult,
} from '@sanity-types';

// Tipos de datos
import type { DateString, IsoDateTime } from '@utils/date.utils';

// Unwrapper de tipos definidos en Array<...>
type UnwrapArray<A> = A extends unknown[] ? UnwrapArray<A[number]> : A;

// Acepta el autor crudo sin los timestamps de ficha (los proyecta solo `authorBySlugQuery`, no el
// autor embebido en `literaryWorkBySlugQuery`), para que ambos orígenes compartan este mapper de
// dominio.
export function mapAuthor(
	rawAuthorData: Omit<NonNullable<AuthorBySlugQueryResult>, 'createdAt' | 'updatedAt'>,
): Author {
	const resources = mapResources(rawAuthorData.resources);
	// Sin fallback a cadena vacía: el campo es requerido en el schema, y `createMarkdown` lanza si
	// alguna vez llegara vacío en lugar de dejar pasar un autor sin biografía.
	const biography = markdownToSanitizedHtml(createMarkdown(rawAuthorData.biography));

	return {
		_id: rawAuthorData._id,
		slug: rawAuthorData.slug,
		nationality: {
			country: rawAuthorData.nationality?.country,
			flag: urlFor(rawAuthorData.nationality.flag),
		},
		resources: resources,
		tags: mapTags(rawAuthorData.tags),
		imageUrl: urlFor(rawAuthorData.image),
		name: rawAuthorData.name,
		biography: biography,
		bornOn: rawAuthorData.bornOn ? (rawAuthorData.bornOn as DateString) : undefined,
		diedOn: rawAuthorData.diedOn ? (rawAuthorData.diedOn as DateString) : undefined,
		bornOnYear: rawAuthorData.bornOnYear ?? undefined,
		diedOnYear: rawAuthorData.diedOnYear ?? undefined,
	};
}

// Variante para la página de perfil: agrega las fechas de la ficha sobre el `Author` base.
export function mapAuthorProfile(rawAuthorData: NonNullable<AuthorBySlugQueryResult>): AuthorProfile {
	return {
		...mapAuthor(rawAuthorData),
		createdAt: rawAuthorData.createdAt as IsoDateTime,
		updatedAt: rawAuthorData.updatedAt as IsoDateTime,
	};
}
type AuthorTeaserForListSubQuery = UnwrapArray<AuthorsQueryResult>;
type AuthorTeaserForCollectionSubQuery =
	NonNullable<CollectionBySlugQueryResult>['literaryWorks'][number]['authors'][number];
type AuthorTeaserForHighlightSubQuery = HighlightedAuthorsSubQuery[number]['author'];
export function mapAuthorTeaser(
	rawAuthorData: AuthorTeaserForListSubQuery | AuthorTeaserForCollectionSubQuery | AuthorTeaserForHighlightSubQuery,
): AuthorTeaser {
	return {
		_id: rawAuthorData._id,
		slug: rawAuthorData.slug,
		nationality: {
			country: rawAuthorData.nationality?.country,
			flag: urlFor(rawAuthorData.nationality.flag),
		},
		resources: [],
		tags: [],
		imageUrl: urlFor(rawAuthorData.image),
		name: rawAuthorData.name,
		bornOn: rawAuthorData.bornOn ? (rawAuthorData.bornOn as DateString) : undefined,
		diedOn: rawAuthorData.diedOn ? (rawAuthorData.diedOn as DateString) : undefined,
		bornOnYear: rawAuthorData.bornOnYear ?? undefined,
		diedOnYear: rawAuthorData.diedOnYear ?? undefined,
	};
}

/**
 * URL canónica del asset, sin parámetros de transformación: los agrega el `IMAGE_LOADER` del
 * frontend. Agregar uno acá lo duplicaría, y el CDN se queda con el primero.
 */
export function urlFor(source: SanityImageSource): string {
	if (!source) {
		console.warn('urlFor: Se recibió source vacío o nulo');
		return '';
	}
	try {
		return createImageUrlBuilder(client).image(source).url();
	} catch (error) {
		console.error('urlFor: Error al construir URL de imagen', { error, source: JSON.stringify(source) });
		return '';
	}
}

type ResourcesSubQuery = (
	NonNullable<AuthorBySlugQueryResult> | NonNullable<LiteraryWorkBySlugQueryResult>
)['resources'];
type RawResource = NonNullable<ResourcesSubQuery>[number];

// Los recursos se pintan como `href` de un enlace, así que el esquema decide si la URL navega o
// ejecuta. El tipo `url` del Studio ya acota los esquemas en el punto de edición, pero valida la
// edición y no lo almacenado — el mismo motivo por el que la ausencia de URL se filtra acá abajo.
const NAVIGABLE_URL_SCHEMES = Object.freeze(['http:', 'https:', 'mailto:']);

// El typegen deriva `url: string` del `Rule.required()` del schema, pero esa regla valida la edición
// en el Studio, no lo ya almacenado: hay documentos persistidos sin URL. El tipo miente, y sin este
// guard la ausencia cruza la frontera y revienta al primer consumidor que la lea como string.
function hasUrl(resource: RawResource): boolean {
	if (typeof resource.url !== 'string' || resource.url.length === 0) {
		return false;
	}

	try {
		return NAVIGABLE_URL_SCHEMES.includes(new URL(resource.url).protocol);
	} catch {
		// Una URL que el parser rechaza no tiene esquema del cual decidir: se descarta con las demás.
		return false;
	}
}

export function mapResources(resources: ResourcesSubQuery): Resource[] {
	const discarded = resources?.filter((resource) => !hasUrl(resource)) ?? [];
	if (discarded.length > 0) {
		// Solo el título: el resto de los campos del recurso descartado son tan poco confiables como la
		// URL que falta, y esta rama existe justamente para no lanzar.
		console.warn('mapResources: se descartan recursos sin URL', { titles: discarded.map((r) => r.title) });
	}

	return (
		resources?.filter(hasUrl).map((resource) => ({
			title: resource.title,
			url: resource.url,
			resourceType: {
				slug: resource.resourceType.slug,
				title: resource.resourceType.title,
				description: resource.resourceType.description,
			},
		})) ?? []
	);
}

type TagsSubQuery =
	| NonNullable<AuthorBySlugQueryResult>['tags']
	| NonNullable<LiteraryWorkBySlugQueryResult>['tags']
	| NonNullable<CollectionBySlugQueryResult>['tags']
	| NonNullable<CollectionBySlugQueryResult>['literaryWorks'][number]['tags']
	| HighlightedAuthorsSubQuery[number]['tags'];
export function mapTags(tags: TagsSubQuery): Tag[] {
	return tags.map((tag) => ({
		title: tag.title,
		slug: tag.slug,
		description: tag.description,
	}));
}

type HighlightedAuthorsSubQuery = NonNullable<LandingPageContentQueryResult>['highlightedAuthors'];
type ContentCampaignsSubQuery = NonNullable<LandingPageContentQueryResult>['campaigns'];
export function mapContentCampaigns(campaigns: ContentCampaignsSubQuery): ContentCampaign[] {
	return campaigns.map((campaign) => {
		const { xs, md } = campaign.contents;

		if (!xs || !md) {
			throw new Error('Campaign content not found');
		}

		return {
			title: campaign.title,
			slug: campaign.slug,
			url: campaign.url,
			contents: {
				xs: {
					imageUrl: xs.image ? urlFor(xs.image) : '',
					imageWidth: viewportElementSizes.xs.imageWidth,
					imageHeight: viewportElementSizes.xs.imageHeight,
				},
				md: {
					imageUrl: md.image ? urlFor(md.image) : '',
					imageWidth: viewportElementSizes.md.imageWidth,
					imageHeight: viewportElementSizes.md.imageHeight,
				},
			},
		};
	});
}
