export const STABLE_SLUGS = Object.freeze({
	author: 'jorge-luis-borges',
	// Cada slug de acá tiene que existir en los dos datasets que sirven a los e2e (development en local,
	// staging en CI): el que exista solo en uno deja sus casos salteados justo donde tenían que correr.
	literaryWork: 'el-fin',
	// La obra estable con curaduría multimedia: al menos dos recursos, para que el cambio de formato
	// tenga qué elegir, y de un autor con más de una obra, para que las sugerencias del pie no salgan
	// vacías. `el-fin` no puede cubrir ninguna de las dos cosas.
	literaryWorkWithMedia: 'a-la-deriva',
	collection: 'verano-2022',
} as const);

export const SITEWIDE_SCHEMA_IDS = Object.freeze(['organization', 'website'] as const);

export const SCHEMA_IDS = Object.freeze({
	organization: 'organization',
	website: 'website',
	article: 'article',
	profilePage: 'profile-page',
	breadcrumbAuthor: 'breadcrumb-author',
	breadcrumbLiteraryWork: 'breadcrumb-literary-work',
	collection: 'collection',
	breadcrumbCollection: 'breadcrumb-collection',
	collectionCatalog: 'collection-catalog',
	breadcrumbCollectionCatalog: 'breadcrumb-collection-catalog',
	literaryWorkCatalog: 'literary-work-catalog',
	breadcrumbLiteraryWorkCatalog: 'breadcrumb-literary-work-catalog',
} as const);
