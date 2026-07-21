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
import { provideStoryApiMock } from '../../providers/story.mock';
import { InMemoryLayoutService } from '../../providers/layout.mock';
import { LayoutService } from '../../providers/layout.interface';

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
			providers: [provideStoryApiMock()],
			inputs: {
				slug: storyMock.slug,
			},
		});
	};

	it('should create', async () => {
		const view = setup();
		expect(view).toBeTruthy();
	});
});

describe('StoryComponent - headerPosition', () => {
	let mockLayoutService: InMemoryLayoutService;

	const setup = async () => {
		mockLayoutService = new InMemoryLayoutService();
		const view = await render(StoryComponent, {
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
			componentProviders: [{ provide: LayoutService, useValue: mockLayoutService }],
			providers: [provideStoryApiMock()],
			inputs: {
				slug: storyMock.slug,
			},
		});
		return view.fixture.componentInstance as unknown as { headerPosition: () => string };
	};

	it('derives top-header-height when viewport is larger than xs (covers SSR, which fixes viewport to md)', async () => {
		const { headerPosition } = await setup();
		mockLayoutService.simulateViewport('lg');

		expect(headerPosition()).toBe('top-header-height');
	});

	it('derives top-header-height on xs while the header is visible (initial state before any scroll)', async () => {
		const { headerPosition } = await setup();
		mockLayoutService.simulateViewport('xs');

		expect(headerPosition()).toBe('top-header-height');
	});

	it('derives top-0 on xs when the header is hidden after scrolling down', async () => {
		const { headerPosition } = await setup();
		mockLayoutService.simulateViewport('xs');
		mockLayoutService.isHeaderVisible.set(false);

		expect(headerPosition()).toBe('top-0');
	});

	it('recomputes to top-header-height when viewport grows past xs while the header is hidden', async () => {
		const { headerPosition } = await setup();
		mockLayoutService.simulateViewport('xs');
		mockLayoutService.isHeaderVisible.set(false);
		expect(headerPosition()).toBe('top-0');

		mockLayoutService.simulateViewport('lg');

		expect(headerPosition()).toBe('top-header-height');
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
