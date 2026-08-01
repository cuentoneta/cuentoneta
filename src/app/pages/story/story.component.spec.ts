// Core
import { Component, input } from '@angular/core';
import { CommonModule, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// 3rd party modules
import { render, screen } from '@testing-library/angular';
import { DeferBlockState, type ComponentFixture } from '@angular/core/testing';

// Models
import { storylistMock } from '@mocks/storylist.mock';
import { Story } from '@models/story.model';

// Components
import StoryComponent from './story.component';
import { storyMock } from '@mocks/story.mock';
import { provideStoryApiMock } from '../../providers/story.mock';
import { ControllableLayoutService } from '../../providers/layout.mock';
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
				MockAuthorReadingSuggestionsComponent,
				MockCollectionReadingSuggestionsComponent,
			],
			providers: [provideStoryApiMock(), { provide: LayoutService, useValue: new ControllableLayoutService() }],
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

describe('StoryComponent - sugerencias de lectura', () => {
	const setup = async (navigation: 'author' | 'storylist' = 'author', navigationSlug?: string) =>
		render(StoryComponent, {
			componentImports: [
				CommonModule,
				HttpClientTestingModule,
				NgForOf,
				NgIf,
				NgOptimizedImage,
				MockBioSummaryCardComponent,
				MockShareContentComponent,
				MockAuthorReadingSuggestionsComponent,
				MockCollectionReadingSuggestionsComponent,
			],
			providers: [provideStoryApiMock(), { provide: LayoutService, useValue: new ControllableLayoutService() }],
			inputs: { slug: storyMock.slug, navigation, navigationSlug },
		});

	const renderDeferBlocks = async (fixture: ComponentFixture<StoryComponent>) => {
		for (const deferBlock of await fixture.getDeferBlocks()) {
			await deferBlock.render(DeferBlockState.Complete);
		}
	};

	it('should keep the suggestions out of the initial render, deferred until the viewport reaches them', async () => {
		await setup();

		expect(screen.queryByTestId('author-reading-suggestions')).not.toBeInTheDocument();
	});

	it('should mount the author suggestions once the deferred block renders', async () => {
		const { fixture } = await setup();

		await renderDeferBlocks(fixture);

		expect(screen.getByTestId('author-reading-suggestions')).toBeInTheDocument();
		expect(screen.queryByTestId('collection-reading-suggestions')).not.toBeInTheDocument();
	});

	it('should mount the collection suggestions when navigating from a collection', async () => {
		const { fixture } = await setup('storylist', storylistMock.slug);

		await renderDeferBlocks(fixture);

		expect(screen.getByTestId('collection-reading-suggestions')).toBeInTheDocument();
		expect(screen.queryByTestId('author-reading-suggestions')).not.toBeInTheDocument();
	});
});

describe('StoryComponent - headerPosition', () => {
	let mockLayoutService: ControllableLayoutService;

	const setup = async () => {
		mockLayoutService = new ControllableLayoutService();
		const view = await render(StoryComponent, {
			componentImports: [
				CommonModule,
				HttpClientTestingModule,
				NgForOf,
				NgIf,
				NgOptimizedImage,
				MockBioSummaryCardComponent,
				MockShareContentComponent,
				MockAuthorReadingSuggestionsComponent,
				MockCollectionReadingSuggestionsComponent,
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
	selector: 'cuentoneta-author-reading-suggestions:not(p)',
	template: '',
	host: { 'data-testid': 'author-reading-suggestions' },
})
class MockAuthorReadingSuggestionsComponent {
	public readonly authorSlug = input.required<string>();
	public readonly authorName = input.required<string>();
	public readonly currentWorkSlug = input<string>();
}

@Component({
	standalone: true,
	selector: 'cuentoneta-collection-reading-suggestions:not(p)',
	template: '',
	host: { 'data-testid': 'collection-reading-suggestions' },
})
class MockCollectionReadingSuggestionsComponent {
	public readonly collectionSlug = input.required<string>();
	public readonly currentWorkSlug = input<string>();
}
