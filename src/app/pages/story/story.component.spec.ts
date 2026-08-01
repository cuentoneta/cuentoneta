// Core
import { Component, input } from '@angular/core';
import { CommonModule, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// 3rd party modules
import { render, screen } from '@testing-library/angular';
import { By } from '@angular/platform-browser';

// Models
import { storylistMock } from '@mocks/storylist.mock';
import type { NavigationParams } from '@app-utils/navigation-params';
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
				MockReadingSuggestionsComponent,
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
				MockReadingSuggestionsComponent,
			],
			providers: [provideStoryApiMock(), { provide: LayoutService, useValue: new ControllableLayoutService() }],
			inputs: { slug: storyMock.slug, navigation, navigationSlug },
		});

	// La página monta el bloque y le pasa el contexto; qué variante se elige y cuándo se difiere es
	// asunto de ReadingSuggestions, que lo cubre en su propio spec.
	it('should mount the suggestions block once the work is loaded', async () => {
		await setup();

		expect(screen.getByTestId('reading-suggestions')).toBeInTheDocument();
	});

	it('should hand the block the context the reader arrived with', async () => {
		const view = await setup('storylist', storylistMock.slug);

		const block = view.fixture.debugElement.query(By.directive(MockReadingSuggestionsComponent));

		expect(block.componentInstance.navigationParams()).toEqual({
			navigation: 'storylist',
			navigationSlug: storylistMock.slug,
		});
		expect(block.componentInstance.currentWorkSlug()).toBe(storyMock.slug);
		expect(block.componentInstance.authorName()).toBe(storyMock.author.name);
	});

	it('should fall back to the author context when the collection slug is missing', async () => {
		const view = await setup('storylist');

		const block = view.fixture.debugElement.query(By.directive(MockReadingSuggestionsComponent));

		expect(block.componentInstance.navigationParams()).toEqual({
			navigation: 'author',
			navigationSlug: storyMock.author.slug,
		});
	});

	it('should share the link with the very context the reader arrived with', async () => {
		const view = await setup('storylist', storylistMock.slug);

		const { shareContentParams, navigationParams } = view.fixture.componentInstance as unknown as {
			shareContentParams: () => unknown;
			navigationParams: () => unknown;
		};

		expect(shareContentParams()).toEqual(navigationParams());
		expect(shareContentParams()).toEqual({ navigation: 'storylist', navigationSlug: storylistMock.slug });
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
				MockReadingSuggestionsComponent,
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
	selector: 'cuentoneta-reading-suggestions:not(p)',
	template: '',
	host: { 'data-testid': 'reading-suggestions' },
})
class MockReadingSuggestionsComponent {
	public readonly navigationParams = input.required<NavigationParams>();
	public readonly authorName = input<string>('');
	public readonly currentWorkSlug = input<string>();
}
