export const STABLE_SLUGS = Object.freeze({
	story: 'el-aleph',
	author: 'jorge-luis-borges',
	storylist: 'verano-2022',
	// Obra curada a mano en los datasets para los e2e de /read; hasta que exista, los tests
	// dependientes de contenido se saltean (ver e2e/seo/read.spec.ts).
	literaryWork: 'la-obra-de-prueba',
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
} as const);
