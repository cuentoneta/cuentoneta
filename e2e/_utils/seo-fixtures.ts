export const STABLE_SLUGS = Object.freeze({
	story: 'el-aleph',
	author: 'jorge-luis-borges',
	storylist: 'verano-2022',
	// Verificado contra los dos datasets que sirven a los e2e (development y staging): sin una obra que
	// exista en ambos, todo caso de `/read` se saltea por su guarda de contenido y el verde no dice nada.
	literaryWork: 'el-fin',
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
} as const);
