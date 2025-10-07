import { render, screen, RenderResult } from '@testing-library/angular';
import { StorylistCardDeckComponent } from './storylist-card-deck.component';
import { storyListMock } from '../../mocks/storylist.mock';
import { provideRouter } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Storylist } from '@models/storylist.model';

describe('StorylistCardDeckComponent', () => {
	const defaultProviders = [provideRouter([]), DatePipe];

	const renderComponent = async (inputs?: {
		storylist?: Storylist;
		isLoading?: boolean;
	}): Promise<RenderResult<StorylistCardDeckComponent>> => {
		return render(StorylistCardDeckComponent, {
			inputs,
			providers: defaultProviders,
		});
	};

	it('should create', async () => {
		const { container } = await renderComponent();
		expect(container).toBeTruthy();
	});

	it('should render skeletons when loading', async () => {
		await renderComponent({ isLoading: true });

		const skeletons = screen.getAllByTestId('story-card-skeleton');
		expect(skeletons.length).toBeGreaterThan(0);
	});

	it('should render publications when storylist has publications', async () => {
		await renderComponent({ storylist: storyListMock, isLoading: false });

		const publicationCards = screen.getAllByTestId('publication-card');
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

		await renderComponent({ storylist: publishedStorylist, isLoading: false });

		const publicationCard = screen.getByTestId('publication-card');
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

		await renderComponent({ storylist: unpublishedStorylist, isLoading: false });

		const skeletons = screen.getAllByTestId('story-card-skeleton');
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
		await renderComponent({ storylist: storyListMock, isLoading: false });

		const publicationContainers = screen.getAllByTestId('publication-container');
		expect(publicationContainers.length).toBeGreaterThan(0);
	});

	it('should handle empty storylist gracefully', async () => {
		const emptyStorylist = {
			...storyListMock,
			publications: [],
		};

		await renderComponent({ storylist: emptyStorylist, isLoading: false });

		const publicationCards = screen.queryAllByTestId('publication-card');
		expect(publicationCards.length).toBe(0);
	});
});
