import { AuthorTeaserComponent } from './author-teaser.component';
import { applicationConfig, Meta, moduleMetadata } from '@storybook/angular';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { authorTeaserMock } from '../../mocks/author.mock';
import { provideRouter } from '@angular/router';

export default {
	title: 'AuthorTeaserComponent',
	component: AuthorTeaserComponent,
	decorators: [
		applicationConfig({
			providers: [provideRouter([])],
		}),
		moduleMetadata({
			imports: [CommonModule, NgOptimizedImage],
			providers: [],
		}),
	],
} as Meta<AuthorTeaserComponent>;

export const Primary = {
	render: (args: AuthorTeaserComponent) => ({
		props: args,
		template: `
	  <div class="grid grid-cols-2 gap-8">
		<cuentoneta-author-teaser [author]="author" [variant]="'sm'"/>
		<cuentoneta-author-teaser [author]="author" [variant]="'md'"/>
		</div>
		`,
	}),
	args: {
		author: authorTeaserMock,
	},
};
