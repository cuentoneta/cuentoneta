export const Endpoints = Object.freeze({
	Author: 'api/author',
	Collection: 'api/collection',
	Story: 'api/story',
	StoryList: 'api/storylist',
	Contributor: 'api/contributor',
	LiteraryWork: 'api/literary-work',
} as const);
export type Endpoints = (typeof Endpoints)[keyof typeof Endpoints];

export type ApiUrl = `${string}${Endpoints}`;
