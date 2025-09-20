import { StoryCardTeaserComponent } from './story-card-teaser.component';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { storyNavigationTeaserWithAuthorMock, storyTeaserMock } from '../../mocks/story.mock';
import { authorTeaserMock } from '../../mocks/author.mock';
import { StoryTeaserWithAuthor } from '@models/story.model';

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
			inputs: {
				story: storyNavigationTeaserWithAuthorMock,
				navigationParams: navigationParams,
			},
		});
		expect(container).toBeTruthy();
	});

	it('should display the mock story title', async () => {
		await render(StoryCardTeaserComponent, {
			inputs: {
				story: storyNavigationTeaserWithAuthorMock,
				navigationParams: navigationParams,
			},
		});
		const resourceElement = screen.getByText(storyNavigationTeaserWithAuthorMock.title);
		expect(resourceElement).toBeInTheDocument();
	});

	it('should display the approximate reading time', async () => {
		await render(StoryCardTeaserComponent, {
			inputs: {
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
			inputs: {
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
			inputs: {
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
			inputs: {
				story: storyNavigationTeaserWithAuthorMock,
				navigationParams: navigationParams,
			},
		});
		const orderElement = screen.queryByText(`03.`);
		expect(orderElement).not.toBeInTheDocument();
	});

	it('should display the author name and avatar', async () => {
		await render(StoryCardTeaserComponent, {
			inputs: {
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
			inputs: {
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
			inputs: {
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
			inputs: {
				story: undefined,
				navigationParams: navigationParams,
			},
		});
		const skeleton = screen.getByTestId('skeleton');
		expect(skeleton).toBeInTheDocument();
	});

	describe('Excerpt functionality', () => {
		const storyWithExcerpt: StoryTeaserWithAuthor = {
			...storyTeaserMock,
			author: authorTeaserMock,
		};

		it('should display excerpt when showExcerpt is true and story has paragraphs', async () => {
			await render(StoryCardTeaserComponent, {
				inputs: {
					story: storyWithExcerpt,
					showExcerpt: true,
					excerptLines: 3,
				},
			});
			const excerptElement = screen.getByTestId('portable-text-parser');
			expect(excerptElement).toBeInTheDocument();
		});

		it('should not display excerpt when showExcerpt is false', async () => {
			await render(StoryCardTeaserComponent, {
				inputs: {
					story: storyWithExcerpt,
					showExcerpt: false,
					excerptLines: 3,
				},
			});
			const excerptElement = screen.queryByTestId('portable-text-parser');
			expect(excerptElement).not.toBeInTheDocument();
		});

		it('should apply correct CSS class for excerpt lines', async () => {
			await render(StoryCardTeaserComponent, {
				inputs: {
					story: storyWithExcerpt,
					showExcerpt: true,
					excerptLines: 4,
				},
			});
			const excerptElement = screen.getByTestId('portable-text-parser');
			expect(excerptElement).toHaveClass('line-clamp-4');
		});

		it('should not display excerpt when story has no paragraphs', async () => {
			const storyWithoutParagraphs = {
				...storyWithExcerpt,
				paragraphs: [],
			};
			await render(StoryCardTeaserComponent, {
				inputs: {
					story: storyWithoutParagraphs,
					showExcerpt: true,
					excerptLines: 3,
				},
			});
			const excerptElement = screen.queryByTestId('portable-text-parser');
			expect(excerptElement).not.toBeInTheDocument();
		});
	});

	describe('Order formatting', () => {
		it('should format single digit orders with leading zero', async () => {
			await render(StoryCardTeaserComponent, {
				inputs: {
					story: storyNavigationTeaserWithAuthorMock,
					order: 5,
				},
			});
			const orderElement = screen.getByText('05.');
			expect(orderElement).toBeInTheDocument();
		});

		it('should not format double digit orders', async () => {
			await render(StoryCardTeaserComponent, {
				inputs: {
					story: storyNavigationTeaserWithAuthorMock,
					order: 15,
				},
			});
			const orderElement = screen.getByText('15.');
			expect(orderElement).toBeInTheDocument();
		});

		it('should handle order value of 10 without leading zero', async () => {
			await render(StoryCardTeaserComponent, {
				inputs: {
					story: storyNavigationTeaserWithAuthorMock,
					order: 10,
				},
			});
			const orderElement = screen.getByText('10.');
			expect(orderElement).toBeInTheDocument();
		});
	});

	describe('Skeleton states', () => {
		it('should pass showAuthor to skeleton component', async () => {
			await render(StoryCardTeaserComponent, {
				inputs: {
					story: undefined,
					showAuthor: true,
				},
			});
			const skeleton = screen.getByTestId('skeleton');
			const showAuthorElement = screen.getByTestId('show-author');
			expect(skeleton).toBeInTheDocument();
			expect(showAuthorElement).toBeInTheDocument();
		});

		it('should pass showExcerpt to skeleton component and render correct number of excerpt lines', async () => {
			const excerptLines = 5;
			await render(StoryCardTeaserComponent, {
				inputs: {
					story: undefined,
					showExcerpt: true,
					excerptLines: excerptLines,
				},
			});
			const skeleton = screen.getByTestId('skeleton');
			const showExcerptElement = screen.getByTestId('show-excerpt');
			expect(skeleton).toBeInTheDocument();
			expect(showExcerptElement).toBeInTheDocument();

			// Check that exactly the correct number of excerpt lines are rendered
			for (let i = 0; i < excerptLines; i++) {
				expect(screen.getByTestId(`excerpt-skeleton-line-${i}`)).toBeInTheDocument();
			}
			// Check that no extra lines are rendered
			expect(screen.queryByTestId(`excerpt-skeleton-line-${excerptLines}`)).not.toBeInTheDocument();
		});

		it('should pass order to skeleton component', async () => {
			await render(StoryCardTeaserComponent, {
				inputs: {
					story: undefined,
					order: 7,
				},
			});
			const skeleton = screen.getByTestId('skeleton');
			const showOrder = screen.getByTestId('show-order');

			expect(skeleton).toBeInTheDocument();
			expect(showOrder).toBeInTheDocument();
		});
	});

	describe('Navigation parameters', () => {
		it('should include navigation params in story link when provided', async () => {
			const customNavigationParams = {
				navigation: 'collection',
				navigationSlug: 'fantasy-stories',
			};
			await render(StoryCardTeaserComponent, {
				inputs: {
					story: storyNavigationTeaserWithAuthorMock,
					navigationParams: customNavigationParams,
				},
			});
			const storyLinks = screen.getAllByRole('link');
			const storyLink = storyLinks.find((link) => link.getAttribute('href')?.includes('/story/')) as HTMLAnchorElement;
			expect(storyLink.href).toContain('navigation=collection');
			expect(storyLink.href).toContain('navigationSlug=fantasy-stories');
		});

		it('should work without navigation params', async () => {
			await render(StoryCardTeaserComponent, {
				inputs: {
					story: storyNavigationTeaserWithAuthorMock,
					navigationParams: undefined,
				},
			});
			const storyLinks = screen.getAllByRole('link');
			const storyLink = storyLinks.find((link) => link.getAttribute('href')?.includes('/story/')) as HTMLAnchorElement;
			expect(storyLink).toBeInTheDocument();
		});
	});

	describe('Combined scenarios', () => {
		it('should display all elements when all options are enabled', async () => {
			const storyWithExcerpt: StoryTeaserWithAuthor = {
				...storyTeaserMock,
				author: authorTeaserMock,
			};
			await render(StoryCardTeaserComponent, {
				inputs: {
					story: storyWithExcerpt,
					order: 8,
					showAuthor: true,
					showExcerpt: true,
					excerptLines: 3,
					navigationParams: {
						navigation: 'author',
						navigationSlug: 'test-author',
					},
				},
			});

			const orderElement = screen.getByText('08.');
			expect(orderElement).toBeInTheDocument();

			const authorName = screen.getByText(authorTeaserMock.name);
			expect(authorName).toBeInTheDocument();

			const excerptElement = screen.getByTestId('portable-text-parser');
			expect(excerptElement).toBeInTheDocument();
			expect(excerptElement).toHaveClass('line-clamp-3');

			const titleElement = screen.getByText(storyWithExcerpt.title);
			expect(titleElement).toBeInTheDocument();

			const readingTimeElement = screen.getByText(`${storyWithExcerpt.approximateReadingTime} minutos de lectura`);
			expect(readingTimeElement).toBeInTheDocument();
		});

		it('should only display minimal elements when no optional features are enabled', async () => {
			await render(StoryCardTeaserComponent, {
				inputs: {
					story: storyNavigationTeaserWithAuthorMock,
					showAuthor: false,
					showExcerpt: false,
				},
			});

			// Should have title and reading time
			const titleElement = screen.getByText(storyNavigationTeaserWithAuthorMock.title);
			const readingTimeElement = screen.getByText(
				`${storyNavigationTeaserWithAuthorMock.approximateReadingTime} minutos de lectura`,
			);
			expect(titleElement).toBeInTheDocument();
			expect(readingTimeElement).toBeInTheDocument();

			// Should not have author, order, or excerpt
			const authorName = screen.queryByText(storyNavigationTeaserWithAuthorMock.author.name);
			const orderElement = screen.queryByText(/^\d{2}\.$/);
			const excerptElement = screen.queryByTestId('portable-text-parser');
			expect(authorName).not.toBeInTheDocument();
			expect(orderElement).not.toBeInTheDocument();
			expect(excerptElement).not.toBeInTheDocument();
		});
	});
});
