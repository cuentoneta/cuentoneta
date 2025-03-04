import { StoryCardTeaserComponent } from './story-card-teaser.component';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { storyNavigationTeaserWithAuthorMock } from '../../mocks/story.mock';

describe('StoryCardTeaserComponent', () => {
	const storyUrl = '/story/el-espejo-del-tiempo?navigation=author&navigationSlug=francois-onoff';
	const authorUrl = '/author/francois-onoff';

	let urlTree: UrlTree;
	let navigationParams: { navigation: string; navigationSlug: string } = { navigation: '', navigationSlug: '' };

	beforeEach(() => {
		const urlSerializer = new DefaultUrlSerializer();
		urlTree = urlSerializer.parse(storyUrl);
		navigationParams = urlTree.queryParams as { navigation: string; navigationSlug: string };
	});

	it('should render the component', async () => {
		const { container } = await render(StoryCardTeaserComponent, {
			componentInputs: {
				story: storyNavigationTeaserWithAuthorMock,
				navigationParams: navigationParams,
			},
		});
		expect(container).toBeTruthy();
	});

	it('should display the mock story title', async () => {
		await render(StoryCardTeaserComponent, {
			componentInputs: {
				story: storyNavigationTeaserWithAuthorMock,
				navigationParams: navigationParams,
			},
		});
		const resourceElement = screen.getByText(storyNavigationTeaserWithAuthorMock.title);
		expect(resourceElement).toBeInTheDocument();
	});

	it('should display the approximate reading time', async () => {
		await render(StoryCardTeaserComponent, {
			componentInputs: {
				story: storyNavigationTeaserWithAuthorMock,
				navigationParams: navigationParams,
			},
		});
		const readingTimeElement = screen.getByText(
			`${storyNavigationTeaserWithAuthorMock.approximateReadingTime} minutos de lectura`,
		);
		expect(readingTimeElement).toBeInTheDocument();
	});

	it('should display the link to navigate to the story', async () => {
		await render(StoryCardTeaserComponent, {
			componentInputs: {
				story: storyNavigationTeaserWithAuthorMock,
				navigationParams: navigationParams,
			},
		});
		const linkElement: HTMLAnchorElement = screen.getByRole('link');
		expect(linkElement).toBeInTheDocument();
		expect(linkElement.href.includes(storyUrl)).toBeTruthy();
	});

	it('should display the story order', async () => {
		await render(StoryCardTeaserComponent, {
			componentInputs: {
				story: storyNavigationTeaserWithAuthorMock,
				navigationParams: navigationParams,
				order: 3,
			},
		});
		const orderElement = screen.getByText(`03.`);
		expect(orderElement).toBeInTheDocument();
	});

	it('should not display the story order', async () => {
		await render(StoryCardTeaserComponent, {
			componentInputs: {
				story: storyNavigationTeaserWithAuthorMock,
				navigationParams: navigationParams,
			},
		});
		const orderElement = screen.queryByText(`03.`);
		expect(orderElement).not.toBeInTheDocument();
	});

	it('should display the author name and avatar', async () => {
		await render(StoryCardTeaserComponent, {
			componentInputs: {
				story: storyNavigationTeaserWithAuthorMock,
				navigationParams: navigationParams,
				showAuthor: true,
			},
		});
		const authorName = screen.getByText(storyNavigationTeaserWithAuthorMock.author.name);
		const authorImage = screen.getByRole('img');
		expect(authorName).toBeInTheDocument();
		expect(authorImage).toBeInTheDocument();
	});

	it('should display the link to navigate to the author profile', async () => {
		await render(StoryCardTeaserComponent, {
			componentInputs: {
				story: storyNavigationTeaserWithAuthorMock,
				navigationParams: navigationParams,
				showAuthor: true,
			},
		});
		const [authorLink, storyLink]: HTMLAnchorElement[] = screen.getAllByRole('link');
		expect(authorLink).toBeInTheDocument();
		expect(storyLink).toBeInTheDocument();
		expect(authorLink.href.includes(authorUrl)).toBeTruthy();
		expect(storyLink.href.includes(storyUrl)).toBeTruthy();
	});

	it('should not display the author name and avatar', async () => {
		await render(StoryCardTeaserComponent, {
			componentInputs: {
				story: storyNavigationTeaserWithAuthorMock,
				navigationParams: navigationParams,
				showAuthor: false,
			},
		});
		const authorName = screen.queryByText(storyNavigationTeaserWithAuthorMock.author.name);
		const authorImage = screen.queryByRole('img');
		expect(authorName).not.toBeInTheDocument();
		expect(authorImage).not.toBeInTheDocument();
	});

	it('should display the skeleton', async () => {
		await render(StoryCardTeaserComponent, {
			componentInputs: {
				story: undefined,
				navigationParams: navigationParams,
			},
		});
		const skeleton = screen.getByTestId('skeleton');
		expect(skeleton).toBeInTheDocument();
	});
});
