export const STABLE_SLUGS = Object.freeze({
	story: 'el-aleph',
	author: 'jorge-luis-borges',
	// TODO(#2269): muere con la ruta; `nav-stacking.spec.ts` también lo consume y pasa a `collection`.
	storylist: 'verano-2022',
	// Cada slug de acá tiene que existir en los dos datasets que sirven a los e2e (development en local,
	// staging en CI): el que exista solo en uno deja sus casos salteados justo donde tenían que correr.
	literaryWork: 'el-fin',
	// La obra estable con curaduría multimedia: al menos dos recursos, para que el cambio de formato
	// tenga qué elegir, y de un autor con más de una obra, para que las sugerencias del pie no salgan
	// vacías. `el-fin` no puede cubrir ninguna de las dos cosas.
	literaryWorkWithMedia: 'a-la-deriva',
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
	// TODO(#2269): al retirarse la página de storylist, `collection` pasa a nombrar el bloque de
	// `CollectionPage` —el dueño del término en el dominio— y `breadcrumbStorylist` desaparece.
	collection: 'collection',
	breadcrumbStorylist: 'breadcrumb-storylist',
	breadcrumbRead: 'breadcrumb-read',
	// TODO(#2269): `collection-page` es un nombre prestado hasta que se libere `collection`.
	collectionPage: 'collection-page',
	breadcrumbCollection: 'breadcrumb-collection',
	collectionCatalog: 'collection-catalog',
	breadcrumbCollectionCatalog: 'breadcrumb-collection-catalog',
} as const);
