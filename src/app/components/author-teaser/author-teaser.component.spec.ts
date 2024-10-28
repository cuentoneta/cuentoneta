import { AuthorTeaserComponent } from './author-teaser.component';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { render } from '@testing-library/angular';
import { authorTeaserMock } from '../../mocks/author.mock';
import { RouterTestingModule } from '@angular/router/testing';

describe('AuthorTeaserComponent', () => {
	const setup = async () => {
		return await render(AuthorTeaserComponent, {
			componentImports: [CommonModule, NgOptimizedImage, RouterTestingModule],
			componentProviders: [],
			inputs: {
				author: authorTeaserMock,
			},
		});
	};

	test('should render AuthorTeaserComponent', async () => {
		const view = await setup();
		expect(view).toBeTruthy();
	});
});
