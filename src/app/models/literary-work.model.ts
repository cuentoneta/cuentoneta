import type { Author, AuthorTeaser } from './author.model';
import type { LiteraryWorkSection } from './literary-work-section.model';
import type { Media } from './media.model';
import type { Resource } from './resource.model';
import type { Tag } from './tag.model';
import type { IsoDateTime } from '@utils/date.utils';
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

export interface LiteraryWork extends LiteraryWorkBase {
	// 1..N; la obra anónima referencia al author "Anónimo" (ver isAnonymous).
	readonly authors: readonly Author[];
	readonly content: readonly LiteraryWorkSection[];
	// Media (el contrato que produce el ACL), como Story.media — no la unión MediaTypes.
	readonly mediaSources: readonly Media[];
	readonly resources: readonly Resource[];
	readonly badLanguage?: boolean;
	readonly originalPublication: string;
	readonly publishedAt: IsoDateTime;
}

// El teaser expone la primera sección completa (no vacía el contenido como StoryTeaser):
// decisión de diseño del contrato — ver docs/LITERARY_WORK_DESIGN.md §2.
export interface LiteraryWorkTeaser extends LiteraryWorkBase {
	readonly authors: readonly AuthorTeaser[];
	readonly teaserSection: LiteraryWorkSection;
}

export interface LiteraryWorkNavigationTeaser extends LiteraryWorkBase {
	readonly authors: Array<never>;
}

export interface LiteraryWorkNavigationTeaserWithAuthors extends LiteraryWorkBase {
	readonly authors: readonly AuthorTeaser[];
}

// "Anónimo" es un author real del catálogo: la obra anónima lo referencia explícitamente
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
	// Duración editorial fija (obras recitadas/audiovisuales): reemplaza a la suma de
	// secciones como totalReadingTime — ver LITERARY_WORK_DESIGN.md §5.
	readingTimeOverride?: ReadingTime;
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
	const { readingTimeOverride, ...rest } = options;
	return Object.freeze({
		...rest,
		slug: createSlug(options.slug),
		totalReadingTime: readingTimeOverride ?? sumReadingTimes(options.content.map((section) => section.readingTime)),
		sectionCount: options.content.length,
	});
}
