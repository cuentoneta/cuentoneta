import { createSlug, type Slug } from './slug.model';
import type { LiteraryWorkTeaser } from './literary-work.model';
import type { Media } from './media.model';
import type { SanitizedHtml } from './sanitized-html.model';
import type { Tag } from './tag.model';

// Si la colección tiene portada editorial propia se usa (`representative`); si no, las primeras
// portadas de sus obras (`sample`). El campo del schema es opcional, así que el fallback no es un
// caso de borde sino la mitad de los casos.
export type CollectionImagery =
	| { readonly kind: 'representative'; readonly image: string }
	| { readonly kind: 'sample'; readonly images: readonly [string, string, string] };

interface CollectionBase {
	readonly _id: string;
	readonly slug: Slug;
	readonly title: string;
	readonly description: SanitizedHtml;
	readonly imagery: CollectionImagery;
	readonly tags: readonly Tag[];
	readonly config: { readonly showAuthors: boolean };
	readonly mediaSources: readonly Media[];
	// Las dos vistas lo muestran, y el teaser lo necesita justamente porque no transporta las obras.
	readonly count: number;
}

export interface Collection extends CollectionBase {
	readonly literaryWorks: readonly LiteraryWorkTeaser[];
}

export interface CollectionTeaser extends CollectionBase {
	readonly literaryWorks: Array<never>;
}

interface CreateCollectionOptions {
	_id: string;
	slug: string;
	title: string;
	description: SanitizedHtml;
	imagery: CollectionImagery;
	tags: readonly Tag[];
	config: { readonly showAuthors: boolean };
	mediaSources: readonly Media[];
	literaryWorks: readonly LiteraryWorkTeaser[];
}

/**
 * Construye el agregado haciendo cumplir sus invariantes, en vez de confiar en que quien lo arma las
 * respete. Una colección sin obras no es un estado válido: es un dato incompleto que fallaría recién
 * al renderizarse, lejos de donde se puede corregir.
 *
 * `count` se deriva y no se recibe, que es lo que vuelve imposible que discrepe del número real de
 * obras. La vista de teaser no pasa por acá —no transporta obras, así que no puede sostener la
 * invariante—: la construye el mapper como proyección, igual que `LiteraryWorkTeaser`.
 */
export function createCollection(options: CreateCollectionOptions): Collection {
	if (options.title.trim() === '') {
		throw new Error(`Collection inválida: título vacío (slug "${options.slug}")`);
	}
	if (options.literaryWorks.length === 0) {
		throw new Error(`Collection inválida: sin obras literarias (slug "${options.slug}")`);
	}
	return Object.freeze({
		...options,
		slug: createSlug(options.slug),
		count: options.literaryWorks.length,
	});
}
