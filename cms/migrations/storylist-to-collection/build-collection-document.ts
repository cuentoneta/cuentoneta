/**
 * Núcleo puro de la migración de `storylist` a `collection`: dado el documento crudo de una storylist,
 * arma el documento de la colección equivalente, con su descripción en Markdown y sus obras
 * reapuntadas a las que dejó la migración de `story` a `literaryWork`.
 *
 * Sin I/O ni cliente de Sanity, para poder testearlo sin red ni credenciales. La migración le delega
 * el mapeo entero y se queda solo con la mutación.
 *
 * Los tipos del documento se declaran acá y no se importan del typegen: el typegen describe el
 * **schema**, y lo que la migración lee es el documento crudo tal como Sanity lo devuelve.
 */
import {
	portableTextToMarkdown,
	type PortableTextBlock,
} from '../../../resources/portable-text-to-markdown/portable-text-to-markdown';
import { DRAFTS_PATH_PREFIX, literaryWorkIdFor } from '../story-to-literary-work/build-literary-work-document';

interface SanityReference {
	_type: 'reference';
	_ref: string;
	_key?: string;
	// El Studio marca así una referencia a un documento todavía inédito, y las fortalece al publicarlo.
	_weak?: boolean;
	_strengthenOnPublish?: unknown;
}

export interface StorylistDocument {
	_id: string;
	title?: string;
	slug?: { _type: 'slug'; current: string };
	description?: PortableTextBlock[];
	featuredImage?: unknown;
	tags?: SanityReference[];
	config?: { showAuthors?: boolean };
	stories?: SanityReference[];
	mediaSources?: unknown[];
	// `tabs` no se declara: el tipo destino no lo tiene y la migración no lo lee.
}

/**
 * El documento destino. Declara `_id` y `_type` porque la mutación de creación los exige, y el resto
 * abierto porque el mapeo copia campos del origen sin reinterpretarlos.
 */
export type CollectionDocument = { _id: string; _type: 'collection' } & Record<string, unknown>;

/** Se lanza ante un dato del que no se puede derivar una colección válida. Detiene la corrida. */
export class UnmigratableStorylistError extends Error {
	constructor(message: string, storylistId: string) {
		super(`${message} (storylist "${storylistId}")`);
		this.name = 'UnmigratableStorylistError';
	}
}

/**
 * El `_id` de la colección se deriva del de su storylist de origen. Sostiene tres cosas a la vez: la
 * correspondencia entre ambas, la idempotencia (con `createIfNotExists`, re-migrar es un no-op) y la
 * reversión (la migración inversa filtra por este prefijo). Por eso vive acá, como fuente única que
 * ambas migraciones comparten: una reversión con su propia noción de "documento migrado" podría
 * borrar una colección nacida en el Studio.
 */
export const MIGRATED_ID_PREFIX = 'collection-from-storylist-';

/**
 * El prefijo de path va **antes** que el de la migración, por la misma razón que en la migración de
 * obras: Sanity lee `drafts.` como borrador solo cuando encabeza el `_id`, así que concatenarlo detrás
 * del origen publicaría contenido inédito sin que nada lo señale.
 *
 * La forma se repite en vez de extraerse a un módulo compartido: unificarla obligaría a modificar la
 * migración de obras, ya aplicada en los tres datasets, cuyo valor es ser el registro fiel de lo que
 * corrió. Lo que sí se importa es la constante del prefijo, para no tener dos definiciones de cómo
 * marca Sanity un borrador.
 */
export function collectionIdFor(storylistId: string): string {
	if (storylistId.startsWith(DRAFTS_PATH_PREFIX)) {
		return `${DRAFTS_PATH_PREFIX}${MIGRATED_ID_PREFIX}${storylistId.slice(DRAFTS_PATH_PREFIX.length)}`;
	}
	return `${MIGRATED_ID_PREFIX}${storylistId}`;
}

export function isMigratedCollectionId(id: string): boolean {
	const withoutPath = id.startsWith(DRAFTS_PATH_PREFIX) ? id.slice(DRAFTS_PATH_PREFIX.length) : id;
	return withoutPath.startsWith(MIGRATED_ID_PREFIX);
}

function toRequiredMarkdown(blocks: PortableTextBlock[] | undefined, storylistId: string): string {
	if (!blocks?.length) {
		throw new UnmigratableStorylistError('La storylist no tiene descripción', storylistId);
	}
	const markdown = portableTextToMarkdown(blocks);
	if (markdown.trim() === '') {
		throw new UnmigratableStorylistError('La descripción quedó vacía al convertirla a Markdown', storylistId);
	}
	return markdown;
}

/**
 * Reapunta una historia a su obra migrada, preservando la integridad referencial del origen.
 *
 * **La debilidad se copia del origen y nunca se sintetiza.** Una referencia débil dice que el destino
 * todavía no está publicado; el content lake rechaza una referencia fuerte a un documento inexistente,
 * así que copiarla es lo que permite migrar una colección cuyas obras siguen inéditas. Debilitar una
 * que el origen tiene fuerte sería lo contrario: taparía un dataset a medio migrar.
 *
 * **`_strengthenOnPublish` se retraduce en vez de copiarse**, que es donde difiere de la migración de
 * obras: allá el tipo del destino no cambiaba, acá sí. Copiarla tal cual dejaría una referencia a un
 * `literaryWork` prometiéndole al Studio fortalecerla contra un `story`.
 *
 * El `_key` se preserva del miembro de origen y no se deriva del `_ref`: una misma obra puede aparecer
 * dos veces en la colección, y derivarlo produciría claves duplicadas que Sanity rechaza.
 */
function buildLiteraryWorkReference(story: SanityReference, index: number, storylistId: string): SanityReference {
	if (story._ref.startsWith(DRAFTS_PATH_PREFIX)) {
		throw new UnmigratableStorylistError(`La referencia ${index} de "stories" apunta a un borrador`, storylistId);
	}
	return {
		_type: 'reference',
		_ref: literaryWorkIdFor(story._ref),
		_key: story._key,
		...(story._weak !== undefined ? { _weak: story._weak } : {}),
		...(story._strengthenOnPublish !== undefined
			? { _strengthenOnPublish: { type: 'literaryWork', template: { id: 'literaryWork' } } }
			: {}),
	};
}

function assertKeyed(items: unknown[] | undefined, field: string, storylistId: string): void {
	const missing = (items ?? []).some((item) => !(item as { _key?: string })?._key);
	if (missing) {
		throw new UnmigratableStorylistError(`Hay miembros de "${field}" sin _key`, storylistId);
	}
}

/** Una storylist que ya pasó las validaciones: title y slug dejan de ser opcionales para el llamador. */
type MigratableStorylist = StorylistDocument & { title: string; slug: { current: string } };

/** Lo que la colección no puede construirse sin ello: sin esto el documento nacería inválido. */
function assertMigratable(storylist: StorylistDocument): asserts storylist is MigratableStorylist {
	if (!storylist.title) {
		throw new UnmigratableStorylistError('La storylist no tiene título', storylist._id);
	}
	if (!storylist.slug?.current) {
		throw new UnmigratableStorylistError('La storylist no tiene slug', storylist._id);
	}
	assertKeyed(storylist.stories, 'stories', storylist._id);
	assertKeyed(storylist.tags, 'tags', storylist._id);
	assertKeyed(storylist.mediaSources, 'mediaSources', storylist._id);
}

/**
 * Los campos que viajan sin transformar. Se omiten cuando el origen no los trae, en vez de escribirse
 * vacíos: un array vacío y un campo ausente no se leen igual en las queries, y `undefined` no es un
 * valor válido en un documento de Sanity.
 */
function optionalFields(storylist: StorylistDocument): Partial<CollectionDocument> {
	return {
		...(storylist.featuredImage !== undefined ? { featuredImage: storylist.featuredImage } : {}),
		...(storylist.config !== undefined ? { config: storylist.config } : {}),
		...(storylist.tags?.length ? { tags: storylist.tags } : {}),
		...(storylist.mediaSources?.length ? { mediaSources: storylist.mediaSources } : {}),
	};
}

/**
 * Arma el documento `collection` equivalente a una `storylist`.
 *
 * Lanza `UnmigratableStorylistError` ante un dato que no permite construir una colección válida, en
 * vez de escribir un documento degradado: el repository construye el agregado con factories que
 * validan, así que un documento inválido fallaría recién al leerse, lejos de acá.
 *
 * No toca la storylist de origen: emite un documento nuevo al lado. Por eso la reversión es un borrado
 * limpio y la página vieja sigue sirviéndose durante toda la convivencia.
 */
export function buildCollectionDocument(storylist: StorylistDocument): CollectionDocument {
	assertMigratable(storylist);

	const literaryWorks = (storylist.stories ?? []).map((story, index) =>
		buildLiteraryWorkReference(story, index, storylist._id),
	);

	return {
		_id: collectionIdFor(storylist._id),
		_type: 'collection',
		title: storylist.title,
		slug: { _type: 'slug', current: storylist.slug.current },
		description: toRequiredMarkdown(storylist.description, storylist._id),
		...(literaryWorks.length > 0 ? { literaryWorks } : {}),
		...optionalFields(storylist),
	};
}
