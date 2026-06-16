export const Endpoints = Object.freeze({
	Author: 'api/author',
	Story: 'api/story',
	StoryList: 'api/storylist',
	Contributor: 'api/contributor',
} as const);
export type Endpoints = (typeof Endpoints)[keyof typeof Endpoints];

export type ApiUrl = `${string}${Endpoints}`;
