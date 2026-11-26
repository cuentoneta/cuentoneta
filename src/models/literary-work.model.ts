import type { Author, AuthorTeaser } from './author.model';
import type { LiteraryWorkSection } from './literary-work-section.model';
import type { LiteraryWorkExcerpt } from './literary-work-excerpt.model';
import type { Media, MediaTeaser } from './media.model';
import type { Resource } from './resource.model';
import type { SanitizedHtml } from './sanitized-html.model';
import type { Tag } from './tag.model';
import type { IsoDateTime } from '@utils/date.utils';
import { CATALOG_ENTRY_KINDS, type CatalogEntryBase } from './catalog.model';
import { createSlug, type Slug } from './slug.model';
import { sumReadingTimes, type ReadingTime } from './reading-time.model';

interface LiteraryWorkBase {
	readonly _id: string;
	readonly slug: Slug;
	readonly title: string;
	readonly coverImage: string;
	readonly totalReadingTime: ReadingTime;
	// Total real de secciones de la obra: en la respuesta parcial del endpoint (?section=N)
	// y en los teasers puede ser mayor que las secciones transportadas — ver LITERARY_WORK_DESIGN.md §7.
	readonly sectionCount: number;
	readonly tags: readonly Tag[];
}

// `mediaSources` lo declara cada vista con su propio tipo, igual que `authors`: todas lo exponen,
// pero la tarjeta de listado solo pinta el ícono de la plataforma y su proyección no resuelve la
// carga con la que se reproduce el recurso. Declararlo en la base obligaría a las vistas de teaser
// a prometer lo que su proyección no trae.

export interface LiteraryWork extends LiteraryWorkBase {
	// 1..N; la obra anónima referencia al author "Anónimo" (ver isAnonymous).
	readonly authors: readonly Author[];
	readonly mediaSources: readonly Media[];
	readonly content: readonly LiteraryWorkSection[];
	readonly resources: readonly Resource[];
	readonly badLanguage?: boolean;
	readonly originalPublication: string;
	readonly publishedAt: IsoDateTime;
	// Paratexto editorial sobre la obra. Vive solo acá, no en LiteraryWorkBase: las tarjetas de
	// listado y las vistas de navegación no lo muestran ni deben transportarlo.
	readonly editorialNote?: SanitizedHtml;
}

// El teaser expone un extracto del arranque de la obra, no una sección: su cuerpo va recortado, así
// que no puede prometer el tiempo de lectura ni la posición que una sección declara — ver
// docs/LITERARY_WORK_DESIGN.md §2.
export interface LiteraryWorkTeaser extends LiteraryWorkBase {
	readonly authors: readonly AuthorTeaser[];
	readonly mediaSources: readonly MediaTeaser[];
	readonly excerpt: LiteraryWorkExcerpt;
}

export interface LiteraryWorkNavigationTeaser extends LiteraryWorkBase {
	readonly authors: Array<never>;
	readonly mediaSources: readonly MediaTeaser[];
}

export interface LiteraryWorkNavigationTeaserWithAuthors extends LiteraryWorkBase {
	readonly authors: readonly AuthorTeaser[];
	readonly mediaSources: readonly MediaTeaser[];
}

interface CreateLiteraryWorkNavigationTeaserOptions {
	_id: string;
	slug: string;
	title: string;
	coverImage: string;
	totalReadingTime: ReadingTime;
	sectionCount: number;
	tags: readonly Tag[];
	mediaSources: readonly MediaTeaser[];
	authors: readonly AuthorTeaser[];
}

/**
 * Construye la vista de navegación con autores haciendo cumplir las invariantes que sí puede
 * sostener: título no vacío y al menos un autor.
 *
 * La de autores no es defensiva — es la misma que `createLiteraryWork` hace cumplir para el agregado
 * completo, traducida a esta vista. La proyección la deja pasar (`coalesce(authors[]->…, [])` devuelve
 * la lista vacía tanto para la obra sin autores como para la que los perdió al despublicarse), y las
 * tarjetas que pintan esta vista muestran al primero sin preguntar. Sin la factory, una obra mal
 * curada no rompe donde se puede corregir sino al renderizarse.
 */
export function createLiteraryWorkNavigationTeaser(
	options: CreateLiteraryWorkNavigationTeaserOptions,
): LiteraryWorkNavigationTeaserWithAuthors {
	if (options.title.trim() === '') {
		throw new Error(`LiteraryWorkNavigationTeaser inválido: título vacío (slug "${options.slug}")`);
	}
	if (options.authors.length === 0) {
		throw new Error(
			`LiteraryWorkNavigationTeaser inválido: sin autores (slug "${options.slug}") — la obra anónima referencia al author "Anónimo"`,
		);
	}
	return Object.freeze({ ...options, slug: createSlug(options.slug) });
}

export interface LiteraryWorkCatalogEntry extends CatalogEntryBase<typeof CATALOG_ENTRY_KINDS.literaryWork> {
	readonly title: string;
	readonly authors: readonly Pick<Author, 'slug' | 'name'>[];
	readonly totalReadingTime: ReadingTime;
	readonly tags: readonly Pick<Tag, 'slug' | 'title'>[];
}

interface CreateLiteraryWorkCatalogEntryOptions {
	slug: string;
	title: string;
	authors: readonly Pick<Author, 'slug' | 'name'>[];
	totalReadingTime: ReadingTime;
	tags: readonly Pick<Tag, 'slug' | 'title'>[];
}

/**
 * Construye la entrada de obra del catálogo. Lanza si el slug no tiene formato válido, si el título está
 * vacío o si no hay autores; las etiquetas pueden ser una lista vacía.
 *
 * Proyecta autores y etiquetas campo por campo en lugar de esparcirlos: el tipado estructural deja
 * pasar un `Author` o un `Tag` completo, y sin la proyección la entrada transportaría biografías,
 * recursos y descripciones que su contrato excluye.
 */
export function createLiteraryWorkCatalogEntry(
	options: CreateLiteraryWorkCatalogEntryOptions,
): LiteraryWorkCatalogEntry {
	if (options.title.trim() === '') {
		throw new Error(`LiteraryWorkCatalogEntry inválida: título vacío (slug "${options.slug}")`);
	}
	if (options.authors.length === 0) {
		throw new Error(
			`LiteraryWorkCatalogEntry inválida: sin autores (slug "${options.slug}") — la obra anónima referencia al author "Anónimo"`,
		);
	}
	return Object.freeze({
		kind: CATALOG_ENTRY_KINDS.literaryWork,
		slug: createSlug(options.slug),
		title: options.title,
		authors: options.authors.map(({ slug, name }) => ({ slug, name })),
		totalReadingTime: options.totalReadingTime,
		tags: options.tags.map(({ slug, title }) => ({ slug, title })),
	});
}

// "Anónimo" es un author real del Acervo: la obra anónima lo referencia explícitamente
// en todas las capas (sin normalización en el ACL) — ver docs/LITERARY_WORK_DESIGN.md §10.
// Se compara por slug (clave de negocio), nunca por _id (infraestructura).
export const ANONYMOUS_AUTHOR_SLUG = 'anonimo';

// `every` y no `some`: si la obra referencia a Anónimo y a un autor real, tiene autoría real.
export function isAnonymous(authors: ReadonlyArray<{ readonly slug: string }>): boolean {
	return authors.length > 0 && authors.every((author) => author.slug === ANONYMOUS_AUTHOR_SLUG);
}

interface CreateLiteraryWorkOptions {
	_id: string;
	slug: string;
	title: string;
	authors: readonly Author[];
	coverImage: string;
	content: readonly LiteraryWorkSection[];
	mediaSources: readonly Media[];
	resources: readonly Resource[];
	badLanguage?: boolean;
	tags: readonly Tag[];
	originalPublication: string;
	publishedAt: IsoDateTime;
	editorialNote?: SanitizedHtml;
}

export function createLiteraryWork(options: CreateLiteraryWorkOptions): LiteraryWork {
	if (options.title.trim() === '') {
		throw new Error(`LiteraryWork inválida: título vacío (slug "${options.slug}")`);
	}
	if (options.content.length === 0) {
		throw new Error(`LiteraryWork inválida: sin secciones de contenido (slug "${options.slug}")`);
	}
	if (options.authors.length === 0) {
		throw new Error(
			`LiteraryWork inválida: sin autores (slug "${options.slug}") — la obra anónima referencia al author "Anónimo"`,
		);
	}
	// El agregado completo transporta las secciones 0..sectionCount-1 en orden (position ===
	// índice del array); solo las proyecciones parciales (construidas por el mapper) pueden
	// omitir posiciones.
	options.content.forEach((section, index) => {
		if (section.position !== index) {
			throw new Error(
				`LiteraryWork inválida: posiciones de sección no contiguas (slug "${options.slug}", índice ${index} con position ${section.position})`,
			);
		}
	});
	return Object.freeze({
		...options,
		slug: createSlug(options.slug),
		totalReadingTime: sumReadingTimes(options.content.map((section) => section.readingTime)),
		sectionCount: options.content.length,
	});
}
