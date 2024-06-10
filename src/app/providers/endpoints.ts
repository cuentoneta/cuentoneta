export enum Endpoints {
	Author = 'api/author',
	Story = 'api/story/read',
	StoryList = 'api/storylist',
}

export type ApiUrl = `${string}${Endpoints}`;
