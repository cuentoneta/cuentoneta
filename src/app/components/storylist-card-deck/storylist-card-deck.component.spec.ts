import { render, screen } from '@testing-library/angular';
import { StorylistCardDeckComponent } from './storylist-card-deck.component';
import { storyListMock } from '../../mocks/storylist.mock';
import { provideRouter } from '@angular/router';
import { DatePipe } from '@angular/common';

describe('StorylistCardDeckComponent', () => {
	const defaultProviders = [provideRouter([]), DatePipe];

	const renderComponent = async (inputs = {}) => {
		return await render(StorylistCardDeckComponent, {
			inputs,
			providers: defaultProviders,
		});
	};

	it('should create', async () => {
		const { container } = await renderComponent();
		expect(container).toBeTruthy();
	});

	it('should render skeletons when loading', async () => {
		const { container } = await renderComponent({ isLoading: true });

		const skeletons = container.querySelectorAll('cuentoneta-story-card-skeleton');
		expect(skeletons.length).toBeGreaterThan(0);
	});

	it('should render publications when storylist has publications', async () => {
		const { container } = await renderComponent({ storylist: storyListMock, isLoading: false });

		const publicationCards = container.querySelectorAll('cuentoneta-publication-card');
		expect(publicationCards.length).toBeGreaterThan(0);
	});

	it('should render PublicationCard for published stories', async () => {
		const publishedStorylist = {
			...storyListMock,
			publications: [
				{
					...storyListMock.publications[0],
					published: true,
				},
			],
		};

		const { container } = await renderComponent({ storylist: publishedStorylist, isLoading: false });

		const publicationCard = container.querySelector('cuentoneta-publication-card');
		expect(publicationCard).toBeInTheDocument();
	});

	it('should render skeleton for unpublished stories', async () => {
		const unpublishedStorylist = {
			...storyListMock,
			publications: [
				{
					...storyListMock.publications[0],
					published: false,
				},
			],
		};

		const { container } = await renderComponent({ storylist: unpublishedStorylist, isLoading: false });

		const skeletons = container.querySelectorAll('cuentoneta-story-card-skeleton');
		expect(skeletons.length).toBeGreaterThan(0);
	});

	it('should generate correct navigation URLs with query params', async () => {
		const { fixture } = await renderComponent({ storylist: storyListMock, isLoading: false });

		const component = fixture.componentInstance;
		const urlTree = component.router.createUrlTree(['/', component.appRoutes.Story, 'test-slug'], {
			queryParams: {
				navigation: 'storylist',
				navigationSlug: storyListMock.slug,
			},
		});

		expect(urlTree.toString()).toContain('test-slug');
		expect(urlTree.queryParams['navigation']).toBe('storylist');
		expect(urlTree.queryParams['navigationSlug']).toBe(storyListMock.slug);
	});

	it('should apply correct grid classes to publication containers', async () => {
		const { container } = await renderComponent({ storylist: storyListMock, isLoading: false });

		const publicationContainers = container.querySelectorAll('.xs\\:max-md\\:\\!col-span-1.md\\:col-span-6');
		expect(publicationContainers.length).toBeGreaterThan(0);
	});

	it('should handle empty storylist gracefully', async () => {
		const emptyStorylist = {
			...storyListMock,
			publications: [],
		};

		const { container } = await renderComponent({ storylist: emptyStorylist, isLoading: false });

		const publicationCards = container.querySelectorAll('cuentoneta-publication-card');
		expect(publicationCards.length).toBe(0);
	});
});
