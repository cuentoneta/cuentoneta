import { applicationConfig, Meta, moduleMetadata } from '@storybook/angular';
import { CollectionTeaser } from './collection-teaser.component';
import { NgOptimizedImage } from '@angular/common';
import { provideRouter } from '@angular/router';
import { CollectionTeaserSkeleton } from './collection-teaser-skeleton';
import { storylistMock } from '@mocks/storylist.mock';

const meta: Meta<CollectionTeaser> = {
	component: CollectionTeaser,
	title: 'CollectionTeaser',
	decorators: [
		applicationConfig({
			providers: [provideRouter([])],
		}),
		moduleMetadata({
			imports: [NgOptimizedImage, CollectionTeaserSkeleton],
		}),
	],
};
export default meta;

export const Primary = {
	render: (args: CollectionTeaser) => ({
		props: args,
		template: `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <cuentoneta-storylist-card class="card" [collection]="storylist"/>
          <cuentoneta-storylist-card-skeleton class="card w-full"/>
    </div>
`,
	}),
	args: {
		storylist: storylistMock,
	},
};

export const Loaded = {
	render: (args: CollectionTeaser) => ({
		props: args,
		template: `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-100 p-4">
          <cuentoneta-storylist-card class="card" [collection]="storylist1"/>
          <cuentoneta-storylist-card class="card" [collection]="storylist2"/>
    </div>
`,
	}),
	args: {
		storylist1: storylistMock,
		storylist2: storylistMock,
	},
};

export const Loading = {
	render: (args: CollectionTeaser) => ({
		props: args,
		template: `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-100 p-4">
          <cuentoneta-storylist-card-skeleton class="card w-full"/>
          <cuentoneta-storylist-card-skeleton class="card w-full"/>
    </div>
`,
	}),
};
