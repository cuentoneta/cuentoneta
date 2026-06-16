import { applicationConfig, Meta, moduleMetadata } from '@storybook/angular';
import { CollectionTeaser } from './collection-teaser';
import { NgOptimizedImage } from '@angular/common';
import { provideRouter } from '@angular/router';
import { CollectionTeaserSkeleton } from './collection-teaser-skeleton';
import { storylistMock } from '@mocks/storylist.mock';

const meta: Meta<CollectionTeaser> = {
	component: CollectionTeaser,
	title: 'Componentes/CollectionTeaser',
	decorators: [
		applicationConfig({
			providers: [provideRouter([])],
		}),
		moduleMetadata({
			imports: [NgOptimizedImage, CollectionTeaserSkeleton],
		}),
	],
	parameters: {
		docs: {
			canvas: {
				sourceState: 'shown',
			},
		},
	},
};
export default meta;

export const Primary = {
	render: (args: CollectionTeaser) => ({
		props: args,
		template: `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          <cuentoneta-collection-teaser class="card" [collection]="collection"/>
          <cuentoneta-collection-teaser-skeleton class="card w-full"/>
    </div>
`,
	}),
	args: {
		collection: storylistMock,
	},
};
