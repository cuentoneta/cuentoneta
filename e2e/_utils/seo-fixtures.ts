export const STABLE_SLUGS = Object.freeze({
	author: 'jorge-luis-borges',
	// Cada slug de acá tiene que existir en los dos datasets que sirven a los e2e (development en local,
	// staging en CI): el que exista solo en uno deja sus casos salteados justo donde tenían que correr.
	literaryWork: 'el-fin',
	// La obra estable con curaduría multimedia: al menos dos recursos, para que el cambio de formato
	// tenga qué elegir, y de un autor con más de una obra, para que las sugerencias del pie no salgan
	// vacías. `el-fin` no puede cubrir ninguna de las dos cosas.
	literaryWorkWithMedia: 'a-la-deriva',
	// La obra estable que encabeza sus secciones con un epígrafe con fuente y cierra con nota
	// editorial: la superficie donde el texto ajeno a la obra puede quedar como extracto. `el-fin`
	// tiene nota pero ningún epígrafe, y `a-la-deriva` tampoco, así que ninguna de las dos cubre el caso.
	literaryWorkWithEpigraphs: 'la-morada-del-hombre',
	// La obra estable que titula sus secciones, y por eso la única que emite anclas: es lo que permite
	// afirmar que un salto a un ancla no deja el título tapado por el encabezado fijo.
	literaryWorkWithTitledSections: 'el-camino-de-las-nutrias',
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
