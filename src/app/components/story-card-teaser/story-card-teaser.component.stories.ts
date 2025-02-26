import type { Meta, StoryObj } from '@storybook/angular';
import { StoryCardTeaserComponent } from './story-card-teaser.component';
import { PublicationCardComponent } from '../publication-card/publication-card.component';
import { storyNavigationTeaserMock } from '../../mocks/story.mock';

const meta: Meta<StoryCardTeaserComponent> = {
	component: StoryCardTeaserComponent,
	title: 'StoryCardTeaserComponent',
};
export default meta;
type Story = StoryObj<StoryCardTeaserComponent>;

export const Primary = {
	render: (args: StoryCardTeaserComponent) => ({
		props: args,
		template: `
      <div class="grid grid-cols-2 gap-4">
          <cuentoneta-story-card-teaser
              [story]="story"
              [order]="false"
              [showAuthor]="false"
		/>
          <cuentoneta-story-card-teaser
              [story]="story"
              [order]="3"
              [showAuthor]="false"
		/>
    </div>
`,
	}),
	args: {
		story: storyNavigationTeaserMock,
	},
};
