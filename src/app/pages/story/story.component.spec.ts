// Core
import { Component, input } from '@angular/core';
import { CommonModule, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// 3rd party modules
import { provideRouter, RouterLink } from '@angular/router';
import { render, screen } from '@testing-library/angular';

// Models
import { storylistMock } from '@mocks/storylist.mock';
import type { NavigationParams } from '@app-utils/navigation-params';

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
				RouterLink,
				MockShareContentComponent,
				SpyReadingSuggestionsComponent,
			],
			// El enlace al autor se arma con routerLink: sin la directiva ni un router el ancla no emite
			// href, y sin href no expone rol de enlace.
			providers: [
				provideRouter([]),
				provideStoryApiMock(),
				{ provide: LayoutService, useValue: new ControllableLayoutService() },
			],
			inputs: {
				slug: storyMock.slug,
			},
		});
	};

	it('should create', async () => {
		const view = setup();
		expect(view).toBeTruthy();
	});

	// El pie de la página mostraba un segundo enlace al mismo perfil, duplicando el nombre accesible.
	// La aserción falla si alguien lo reintroduce.
	it('should link to the author once, from the header', async () => {
		await setup();

		const authorLinks = screen.getAllByRole('link', { name: new RegExp(storyMock.author.name, 'iu') });

		expect(authorLinks).toHaveLength(1);
		expect(authorLinks[0]).toHaveAttribute('href', `/author/${storyMock.author.slug}`);
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
				MockShareContentComponent,
				SpyReadingSuggestionsComponent,
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
		await setup('storylist', storylistMock.slug);

		expect(screen.getByTestId('navigation')).toHaveTextContent(`storylist|${storylistMock.slug}`);
		expect(screen.getByTestId('current-work')).toHaveTextContent(storyMock.slug);
		expect(screen.getByTestId('author-name')).toHaveTextContent(storyMock.author.name);
	});

	it('should fall back to the author context when the collection slug is missing', async () => {
		await setup('storylist');

		expect(screen.getByTestId('navigation')).toHaveTextContent(`author|${storyMock.author.slug}`);
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
				MockShareContentComponent,
				SpyReadingSuggestionsComponent,
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

// Doble del bloque de sugerencias: no resuelve datos, solo vuelca en el DOM el contexto que recibe,
// para que la página pueda verificarlo con las queries de Testing Library.
@Component({
	standalone: true,
	selector: 'cuentoneta-reading-suggestions:not(p)',
	template: `
		<span data-testid="navigation">{{ navigationParams().navigation }}|{{ navigationParams().navigationSlug }}</span>
		<span data-testid="author-name">{{ authorName() }}</span>
		<span data-testid="current-work">{{ currentWorkSlug() }}</span>
	`,
	host: { 'data-testid': 'reading-suggestions' },
})
class SpyReadingSuggestionsComponent {
	public readonly navigationParams = input.required<NavigationParams>();
	public readonly authorName = input.required<string>();
	public readonly currentWorkSlug = input<string>();
}
