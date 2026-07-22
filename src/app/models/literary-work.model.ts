import type { Author, AuthorTeaser } from './author.model';
import type { LiteraryWorkSection } from './literary-work-section.model';
import type { MediaTypes } from './media.model';
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
	readonly authors: readonly Author[];
	readonly content: readonly LiteraryWorkSection[];
	readonly mediaSources: readonly MediaTypes[];
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

// Única señal de obra anónima que conoce el dominio: el ACL normaliza la referencia
// al autor "anonimo" antes de construir el agregado — ver docs/LITERARY_WORK_DESIGN.md §10.
export function isAnonymous(authors: readonly unknown[]): boolean {
	return authors.length === 0;
}

interface CreateLiteraryWorkOptions {
	_id: string;
	slug: string;
	title: string;
	authors: readonly Author[];
	coverImage: string;
	content: readonly LiteraryWorkSection[];
	mediaSources: readonly MediaTypes[];
	resources: readonly Resource[];
	badLanguage?: boolean;
	tags: readonly Tag[];
	originalPublication: string;
	publishedAt: IsoDateTime;
}

export function createLiteraryWork(options: CreateLiteraryWorkOptions): LiteraryWork {
	if (options.title.trim() === '') {
		throw new Error(`LiteraryWork inválida: título vacío (slug "${options.slug}")`);
	}
	if (options.content.length === 0) {
		throw new Error(`LiteraryWork inválida: sin secciones de contenido (slug "${options.slug}")`);
	}
	return Object.freeze({
		...options,
		slug: createSlug(options.slug),
		totalReadingTime: sumReadingTimes(options.content.map((section) => section.readingTime)),
		sectionCount: options.content.length,
	});
}
