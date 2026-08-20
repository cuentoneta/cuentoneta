export const STABLE_SLUGS = Object.freeze({
	story: 'el-aleph',
	author: 'jorge-luis-borges',
	storylist: 'verano-2022',
	// Cada slug de acá tiene que existir en los dos datasets que sirven a los e2e (development en local,
	// staging en CI): el que exista solo en uno deja sus casos salteados justo donde tenían que correr.
	literaryWork: 'el-fin',
	// El mismo de storylist a propósito: las dos rutas sirven la misma colección hasta que una redirija
	// a la otra, y compartir el slug deja esa comparación al alcance.
	collection: 'verano-2022',
} as const);

export const SITEWIDE_SCHEMA_IDS = Object.freeze(['organization', 'website'] as const);

export const SCHEMA_IDS = Object.freeze({
	organization: 'organization',
	website: 'website',
	article: 'article',
	breadcrumbStory: 'breadcrumb-story',
	profilePage: 'profile-page',
	breadcrumbAuthor: 'breadcrumb-author',
	collection: 'collection',
	breadcrumbStorylist: 'breadcrumb-storylist',
	breadcrumbRead: 'breadcrumb-read',
	collectionPage: 'collection-page',
	breadcrumbCollection: 'breadcrumb-collection',
} as const);
