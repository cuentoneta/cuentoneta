import type { LandingPageContent, RotatingContent } from '@models/landing-page-content.model';
import type { LandingPageListQueryResult, LatestLandingPageReferencesQueryResult } from '@sanity-types';

export type KeyedReference = { _key: string; _type: 'reference'; _ref: string };

// La carga de una semana futura se arma copiando las referencias de la última semana curada, sin
// resolverlas: el generador no lee contenido, lo reapunta. Por eso el payload habla de referencias
// crudas y no de dominio.
export type LandingPageCreatePayload = {
	_type: string;
	config: string;
	slug: { _type: string; current: string };
	campaigns: KeyedReference[];
	cards: KeyedReference[];
	latestReads: KeyedReference[];
	collections: KeyedReference[];
	latestLiteraryWorks: KeyedReference[];
	highlightedAuthors: KeyedReference[];
};

export interface ContentRepository {
	fetchLandingPageContent(slug: string): Promise<LandingPageContent | null>;
	fetchRotatingContent(): Promise<RotatingContent | null>;
	fetchLandingPagesList(slugs: string[]): Promise<LandingPageListQueryResult>;
	fetchLatestLandingPageReferences(currentSlug: string): Promise<LatestLandingPageReferencesQueryResult>;
	createLandingPages(landingPageObjects: LandingPageCreatePayload[]): Promise<unknown[]>;
	updateMostReadLiteraryWorks(references: readonly KeyedReference[]): Promise<void>;
}
