import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { StoryCardTeaserComponent } from './story-card-teaser.component';
import { storyNavigationTeaserMock } from '../../mocks/story.mock';
import { authorTeaserMock } from '../../mocks/author.mock';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

const meta: Meta<StoryCardTeaserComponent> = {
	component: StoryCardTeaserComponent,
	title: 'StoryCardTeaserComponent',
	decorators: [
		moduleMetadata({
			imports: [CommonModule, RouterTestingModule],
		}),
	],
};
export default meta;
type Story = StoryObj<StoryCardTeaserComponent>;

export const Primary = {
	render: (args: StoryCardTeaserComponent) => ({
		props: args,
		template: `
	<div class="grid grid-cols-2 gap-8">
		<div class="flex flex-col gap-2">
			<span class="inter-body-base">Versión base</span>
			<cuentoneta-story-card-teaser
			[story]="story"
			[order]="false"
			[showAuthor]="false"
			/>
		</div>
		<div class="flex flex-col gap-2">
			<span class="inter-body-base">Esqueleto</span>
			<cuentoneta-story-card-teaser
			[order]="false"
			[showAuthor]="false"
			/>
		</div>
		<div class="flex flex-col gap-2">
			<span class="inter-body-base">Opción sin autor y con índice</span>
			<cuentoneta-story-card-teaser
			[story]="story"
			[order]="3"
			[showAuthor]="false"
			/>
		</div>
		<div class="flex flex-col gap-2">
			<span class="inter-body-base">Esqueleto</span>
			<cuentoneta-story-card-teaser
			[order]="3"
			[showAuthor]="false"
			/>
		</div>
		<div class="flex flex-col gap-2">
			<span class="inter-body-base">Opción con autor y con índice</span>
			<cuentoneta-story-card-teaser
			  [story]="story"
			  [order]="3"
			  [showAuthor]="true"
			/>
		</div>
		<div class="flex flex-col gap-2">
			<span class="inter-body-base">Esqueleto</span>
			<cuentoneta-story-card-teaser
			[order]="3"
			[showAuthor]="true"
			/>
		</div>
	</div>
`,
	}),
	args: {
		story: { ...storyNavigationTeaserMock, author: authorTeaserMock },
		showAuthor: false,
		order: 1,
	},
};
