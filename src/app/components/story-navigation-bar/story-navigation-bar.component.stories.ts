import { Meta } from '@storybook/angular';
import { StoryNavigationBarComponent } from './story-navigation-bar.component';

export default {
	title: 'StoryNavigationBarComponent',
	component: StoryNavigationBarComponent,
} as Meta<StoryNavigationBarComponent>;

export const Primary = {
	render: (args: StoryNavigationBarComponent) => ({
		props: args,
	}),
	args: {
		storylist: undefined,
		selectedStorySlug: '',
	},
};
