export enum Endpoints {
	Author = 'api/author',
	Story = 'api/story',
	StoryList = 'api/storylist',
	Contributor = 'api/contributor',
}

export type ApiUrl = `${string}${Endpoints}`;
