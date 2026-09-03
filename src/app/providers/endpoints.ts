export const Endpoints = Object.freeze({
	Author: 'api/author',
	Collection: 'api/collection',
	Contributor: 'api/contributor',
	LiteraryWork: 'api/literary-work',
} as const);
export type Endpoints = (typeof Endpoints)[keyof typeof Endpoints];

export type ApiUrl = `${string}${Endpoints}`;
