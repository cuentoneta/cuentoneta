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
	// Es el total real solo mientras la query traiga todas las obras: si el listado se pagina o se
	// acota, el total pasa a ser un dato de entrada y la derivación de la factory deja de valer.
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
 * `count` se deriva y no se recibe, lo que descarta que discrepe del número real de obras **mientras
 * la query no acote `literaryWorks`**. Si el listado se pagina, el total tiene que entrar como dato
 * y esta derivación deja de ser válida. La vista de teaser no pasa por acá —no transporta obras, así
 * que no puede sostener la invariante—: la construye el mapper como proyección, igual que
 * `LiteraryWorkTeaser`.
 */
export function createCollection(options: CreateCollectionOptions): Collection {
	if (options.title.trim() === '') {
		throw new Error(`Collection inválida: título vacío (slug "${options.slug}")`);
	}
	if (options.literaryWorks.length === 0) {
		throw new Error(`Collection inválida: sin obras literarias (slug "${options.slug}")`);
	}
	// La tupla de tres solo garantiza el largo en compilación, y el abanico se va a construir desde
	// GROQ, donde un `sample` de dos portadas encaja igual.
	if (options.imagery.kind === 'sample' && options.imagery.images.length !== 3) {
		throw new Error(`Collection inválida: el abanico de portadas necesita tres (slug "${options.slug}")`);
	}
	return Object.freeze({
		...options,
		slug: createSlug(options.slug),
		count: options.literaryWorks.length,
	});
}
