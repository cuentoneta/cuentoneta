import type { Meta, StoryObj } from '@storybook/angular';
import { StoryCardTeaserComponent } from './story-card-teaser.component';

const meta: Meta<StoryCardTeaserComponent> = {
	component: StoryCardTeaserComponent,
	title: 'StoryCardTeaserComponent',
};
export default meta;
type Story = StoryObj<StoryCardTeaserComponent>;

export const Primary: Story = {
	args: {},
};
