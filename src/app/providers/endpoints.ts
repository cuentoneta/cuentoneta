export enum Endpoints {
	Story = 'api/story/read',
	StoryList = 'api/storylist',
}

export type ApiUrl = `${string}${Endpoints}`;
