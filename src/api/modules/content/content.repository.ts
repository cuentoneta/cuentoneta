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

// La carga de una semana futura se arma copiando las referencias de la última semana curada, sin
// resolverlas: el generador no lee contenido, lo reapunta. Por eso habla de referencias crudas y no
// de dominio — pero la forma la declara el puerto, no la query.
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
	updateMostReadLiteraryWorks(references: readonly KeyedReference[]): Promise<void>;
}
