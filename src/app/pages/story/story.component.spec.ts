// Core
import { Component, input } from '@angular/core';
import { CommonModule, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// 3rd party modules
import { render } from '@testing-library/angular';

// Models
import { Storylist } from '@models/storylist.model';
import { Story } from '@models/story.model';

// Components
import StoryComponent from './story.component';
import { storyMock } from '@mocks/story.mock';

describe('StoryComponent', () => {
	const setup = async () => {
		return await render(StoryComponent, {
			componentImports: [
				CommonModule,
				HttpClientTestingModule,
				NgForOf,
				NgIf,
				NgOptimizedImage,
				MockBioSummaryCardComponent,
				MockShareContentComponent,
				MockStoryNavigationBarComponent,
			],
			inputs: {
				slug: storyMock.slug,
				story: storyMock,
			},
		});
	};

	it('should create', async () => {
		const view = setup();
		expect(view).toBeTruthy();
	});
});

@Component({
	standalone: true,
	selector: 'cuentoneta-share-content:not(p)',
	template: '',
})
class MockShareContentComponent {
	public readonly route = input('');
	public readonly params = input<{ [key: string]: string }>({});
	public readonly message = input('');
	public readonly isLoading = input(false);
}

@Component({
	standalone: true,
	selector: 'cuentoneta-bio-summary-card:not(p)',
	template: '',
})
class MockBioSummaryCardComponent {
	public readonly story = input.required<Story>();
}

@Component({
	standalone: true,
	selector: 'cuentoneta-story-navigation-bar:not(p)',
	template: '',
})
class MockStoryNavigationBarComponent {
	public readonly selectedStorySlug = input('');
	public readonly storylist = input<Storylist>();
}
