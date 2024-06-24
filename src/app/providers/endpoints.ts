export enum Endpoints {
	Author = 'api/author',
	Story = 'api/story',
	StoryList = 'api/storylist',
}

export type ApiUrl = `${string}${Endpoints}`;
