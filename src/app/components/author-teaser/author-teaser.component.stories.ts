import { AuthorTeaserComponent } from './author-teaser.component';
import { Meta, moduleMetadata } from '@storybook/angular';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { authorTeaserMock } from '../../mocks/author.mock';
import { RouterTestingModule } from '@angular/router/testing';

export default {
	title: 'AuthorTeaserComponent',
	component: AuthorTeaserComponent,
	decorators: [
		moduleMetadata({
			imports: [CommonModule, NgOptimizedImage, RouterTestingModule],
			providers: [],
		}),
	],
} as Meta<AuthorTeaserComponent>;

export const Primary = {
	render: (args: AuthorTeaserComponent) => ({
		props: args,
		template: `
	  <div class="grid grid-cols-3 gap-4">
		<cuentoneta-author-teaser [author]="author"></cuentoneta-author-teaser>
		</div>
		`,
	}),
	args: {
		author: authorTeaserMock,
	},
};
