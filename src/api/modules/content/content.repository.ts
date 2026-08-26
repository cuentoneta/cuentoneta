import type { LandingPageContent, RotatingContent } from '@models/landing-page-content.model';

export type KeyedReference = { _key: string; _type: 'reference'; _ref: string };

// Lo que el generador de semanas necesita saber de una landing ya cargada: su identidad y qué semana
// configura. No es dominio —no transporta contenido curado— pero tampoco es el shape de Sanity: el
// puerto lo declara por su cuenta para que el service no dependa de los tipos del typegen.
export interface LandingPageSummary {
	readonly _id: string;
	readonly slug: string;
	readonly config: string;
}

/**
 * El contenido de una landing expresado como referencias sin resolver.
 *
 * Habla de referencias y no de dominio porque su consumidor las reapunta en vez de leerlas; la forma la
 * declara el puerto y no la query, para que el service no dependa de los tipos del typegen.
 */
export interface LandingPageReferences {
	readonly _type: string;
	readonly campaigns: readonly KeyedReference[];
	readonly cards: readonly KeyedReference[];
	readonly latestReads: readonly KeyedReference[];
	readonly collections: readonly KeyedReference[];
	readonly latestLiteraryWorks: readonly KeyedReference[];
	readonly highlightedAuthors: readonly KeyedReference[];
}

export type LandingPageCreatePayload = LandingPageReferences & {
	config: string;
	slug: { _type: string; current: string };
};

export interface ContentRepository {
	fetchLandingPageContent(slug: string): Promise<LandingPageContent | null>;
	fetchRotatingContent(): Promise<RotatingContent | null>;
	fetchLandingPagesList(slugs: string[]): Promise<readonly LandingPageSummary[]>;
	fetchLatestLandingPageReferences(currentSlug: string): Promise<LandingPageReferences | null>;
	createLandingPages(landingPageObjects: LandingPageCreatePayload[]): Promise<unknown[]>;
	/**
	 * Reapunta el slot de obras más leídas a las obras de estos slugs, **en este orden**.
	 *
	 * Recibe slugs y no referencias porque quien lo llama no tiene de dónde sacar un identificador: los
	 * slugs salen de una métrica externa. Resolverlos es parte de la escritura y vive con ella, en vez
	 * de obligar al caso de uso a pedirle identificadores a otro repository para después devolvérselos
	 * a éste.
	 *
	 * El orden es el ranking, así que el que se recibe es el que se escribe. Un slug que no resuelve se
	 * descarta en silencio: la obra no existe, y no hay referencia que escribir.
	 */
	updateMostReadLiteraryWorks(slugs: readonly string[]): Promise<void>;
}
