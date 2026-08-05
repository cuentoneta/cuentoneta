/**
 * Núcleo puro de la migración de `story` a `literaryWork`: dado el documento crudo de una story, arma
 * el documento de la obra equivalente con su contenido en Markdown.
 *
 * Sin I/O ni cliente de Sanity, para poder testearlo sin red ni credenciales. La migración le delega
 * el mapeo entero y se queda solo con la mutación.
 *
 * Los tipos del documento se declaran acá y no se importan del typegen: el typegen describe el
 * **schema**, y lo que la migración lee es el documento crudo tal como Sanity lo devuelve. Es el
 * mismo criterio que usa `author-biography-to-markdown`.
 */
import {
	portableTextToMarkdown,
	type PortableTextBlock,
} from '../../../resources/portable-text-to-markdown/portable-text-to-markdown';

interface SanityReference {
	_type: 'reference';
	_ref: string;
	_key?: string;
}

interface StoryEpigraph {
	_key?: string;
	text?: PortableTextBlock[];
	reference?: PortableTextBlock[];
}

export interface StoryDocument {
	_id: string;
	_createdAt?: string;
	title?: string;
	slug?: { _type: 'slug'; current: string };
	author?: SanityReference;
	coverImage?: unknown;
	epigraphs?: StoryEpigraph[];
	body?: PortableTextBlock[];
	review?: PortableTextBlock[];
	tags?: SanityReference[];
	mediaSources?: unknown[];
	resources?: unknown[];
	badLanguage?: boolean;
	originalPublication?: string;
	publishedAt?: string;
}

/**
 * El documento destino. Declara `_id` y `_type` porque la mutación de creación los exige, y el resto
 * abierto porque el mapeo copia campos del origen sin reinterpretarlos.
 */
export type LiteraryWorkDocument = { _id: string; _type: 'literaryWork' } & Record<string, unknown>;

/** Se lanza ante un dato del que no se puede derivar una obra válida. Detiene la corrida. */
export class UnmigratableStoryError extends Error {
	constructor(message: string, storyId: string) {
		super(`${message} (story "${storyId}")`);
		this.name = 'UnmigratableStoryError';
	}
}

/**
 * El `_id` de la obra se deriva del de su story de origen. Sostiene tres cosas a la vez: la
 * correspondencia entre ambas, la idempotencia (con `createIfNotExists`, re-migrar es un no-op) y la
 * reversión (la migración inversa filtra por este prefijo). Por eso vive acá, como fuente única que
 * ambas migraciones comparten: una reversión con su propia noción de "documento migrado" podría
 * borrar una obra nacida en el Studio.
 */
export const MIGRATED_ID_PREFIX = 'lw-from-story-';

/** Sanity marca el borrador de un documento con este prefijo de path en su `_id`. */
export const DRAFTS_PATH_PREFIX = 'drafts.';

/**
 * El prefijo de path va **antes** que el de la migración, no concatenado detrás del origen: Sanity lo
 * lee como borrador solo cuando encabeza el `_id`. Un `drafts.` en el medio deja un documento
 * publicado con un nombre que aparenta lo contrario, así que derivar el id de un borrador sin
 * separarlo publicaría contenido inédito sin que nada lo señale.
 */
export function literaryWorkIdFor(storyId: string): string {
	if (storyId.startsWith(DRAFTS_PATH_PREFIX)) {
		return `${DRAFTS_PATH_PREFIX}${MIGRATED_ID_PREFIX}${storyId.slice(DRAFTS_PATH_PREFIX.length)}`;
	}
	return `${MIGRATED_ID_PREFIX}${storyId}`;
}

export function isMigratedLiteraryWorkId(id: string): boolean {
	const withoutPath = id.startsWith(DRAFTS_PATH_PREFIX) ? id.slice(DRAFTS_PATH_PREFIX.length) : id;
	return withoutPath.startsWith(MIGRATED_ID_PREFIX);
}

/**
 * Convierte un campo de Portable Text a Markdown, devolviendo `undefined` cuando queda vacío. Las
 * factories de `Markdown`/`SanitizedHtml` rechazan contenido vacío, así que una clave ausente es un
 * estado válido del agregado y un string vacío no lo es.
 */
function toOptionalMarkdown(blocks: PortableTextBlock[] | undefined): string | undefined {
	if (!blocks?.length) {
		return undefined;
	}
	const markdown = portableTextToMarkdown(blocks);
	return markdown.trim() === '' ? undefined : markdown;
}

function toRequiredMarkdown(blocks: PortableTextBlock[] | undefined, field: string, storyId: string): string {
	const markdown = toOptionalMarkdown(blocks);
	if (markdown === undefined) {
		throw new UnmigratableStoryError(`El campo "${field}" quedó vacío al convertirlo a Markdown`, storyId);
	}
	return markdown;
}

interface LiteraryWorkEpigraph {
	_key: string;
	text: string;
	reference?: string;
}

function buildEpigraph(epigraph: StoryEpigraph, index: number, storyId: string): LiteraryWorkEpigraph {
	if (!epigraph._key) {
		throw new UnmigratableStoryError(`El epígrafe ${index} no tiene _key`, storyId);
	}
	const reference = toOptionalMarkdown(epigraph.reference);
	return {
		_key: epigraph._key,
		text: toRequiredMarkdown(epigraph.text, `epigraphs[${index}].text`, storyId),
		...(reference !== undefined ? { reference } : {}),
	};
}

/**
 * La obra migrada nace **mono-sección**: el cuerpo y los epígrafes de la story van a la primera y
 * única sección. `title` queda ausente porque no tiene origen en `Story` — el schema lo declara
 * opcional justamente para este caso, y el render de la vista de lectura lo consume con optional
 * chaining. `readingTime` tampoco se escribe: lo puebla el backfill.
 */
function buildSection(story: StoryDocument): Record<string, unknown> {
	const epigraphs = (story.epigraphs ?? []).map((epigraph, index) => buildEpigraph(epigraph, index, story._id));
	return {
		_type: 'section',
		_key: 'section-0',
		body: toRequiredMarkdown(story.body, 'body', story._id),
		...(epigraphs.length > 0 ? { epigraphs } : {}),
	};
}

/**
 * `Story.author` es una referencia única y requerida; `LiteraryWork.authors` es un array. Envolverla
 * en un array de un elemento satisface la invariante `authors.length >= 1` del agregado. El `_key` se
 * deriva del `_ref`: es determinístico y único dentro del array.
 */
function buildAuthors(story: StoryDocument): SanityReference[] {
	if (!story.author?._ref) {
		throw new UnmigratableStoryError('La story no tiene autor', story._id);
	}
	return [{ _type: 'reference', _ref: story.author._ref, _key: story.author._ref }];
}

function assertKeyed(items: unknown[] | undefined, field: string, storyId: string): void {
	const missing = (items ?? []).some((item) => !(item as { _key?: string })?._key);
	if (missing) {
		throw new UnmigratableStoryError(`Hay miembros de "${field}" sin _key`, storyId);
	}
}

/**
 * Arma el documento `literaryWork` equivalente a una `story`.
 *
 * Lanza `UnmigratableStoryError` ante un dato que no permite construir una obra válida, en vez de
 * escribir un documento degradado: el repository construye el agregado con factories que validan, así
 * que un documento inválido fallaría recién al leerse, lejos de acá.
 */
export function buildLiteraryWorkDocument(story: StoryDocument): LiteraryWorkDocument {
	if (!story.title) {
		throw new UnmigratableStoryError('La story no tiene título', story._id);
	}
	if (!story.slug?.current) {
		throw new UnmigratableStoryError('La story no tiene slug', story._id);
	}
	assertKeyed(story.tags, 'tags', story._id);
	assertKeyed(story.mediaSources, 'mediaSources', story._id);
	assertKeyed(story.resources, 'resources', story._id);

	const editorialNote = toOptionalMarkdown(story.review);
	const publishedAt = story.publishedAt ?? story._createdAt;

	return {
		_id: literaryWorkIdFor(story._id),
		_type: 'literaryWork',
		title: story.title,
		slug: { _type: 'slug', current: story.slug.current },
		authors: buildAuthors(story),
		content: [buildSection(story)],
		// La fecha se copia con fallback al `_createdAt` de la STORY. Omitirla haría que el
		// `coalesce(publishedAt, _createdAt)` de la query resolviera al `_createdAt` del documento
		// nuevo —la fecha de la migración— y el corpus entero perdería su cronología.
		...(publishedAt !== undefined ? { publishedAt } : {}),
		...(editorialNote !== undefined ? { editorialNote } : {}),
		...(story.coverImage !== undefined ? { coverImage: story.coverImage } : {}),
		...(story.tags?.length ? { tags: story.tags } : {}),
		...(story.mediaSources?.length ? { mediaSources: story.mediaSources } : {}),
		...(story.resources?.length ? { resources: story.resources } : {}),
		...(story.badLanguage !== undefined ? { badLanguage: story.badLanguage } : {}),
		...(story.originalPublication !== undefined ? { originalPublication: story.originalPublication } : {}),
	};
}
