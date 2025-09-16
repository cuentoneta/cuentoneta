import { Meta, moduleMetadata } from '@storybook/angular';
import { StoryCardTeaserComponent } from './story-card-teaser.component';
import { storyNavigationTeaserMock, storyTeaserMock } from '../../mocks/story.mock';
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
		<div class="flex flex-col gap-2">
			<span class="inter-body-base">Opción con autor, sin índice y con extracto</span>
			<cuentoneta-story-card-teaser
			  [story]="story"
			  [showAuthor]="true"
			  [showExcerpt]="true"
			/>
		</div>
		<div class="flex flex-col gap-2">
			<span class="inter-body-base">Esqueleto</span>
			<cuentoneta-story-card-teaser
			[showAuthor]="true"
			[showExcerpt]="true"
			/>
		</div>
	</div>
`,
	}),
	args: {
		story: { ...storyTeaserMock, author: authorTeaserMock },
		showAuthor: false,
		order: 1,
	},
};
