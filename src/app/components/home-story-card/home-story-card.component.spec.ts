import { HomeStoryCardComponent } from './home-story-card.component';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { storyNavigationTeaserWithAuthorMock, storyTeaserMock } from '../../mocks/story.mock';
import { authorTeaserMock } from '../../mocks/author.mock';
import type { Media } from '@models/media.model';
import type { StoryTeaserWithAuthor } from '@models/story.model';

describe('HomeStoryCardComponent', () => {
	const storyUrl = '/story/el-espejo-del-tiempo?navigation=author&navigationSlug=francois-onoff';
	const authorUrl = '/author/francois-onoff';

	let navigationParams: { navigation: string; navigationSlug: string } = { navigation: '', navigationSlug: '' };

	beforeEach(() => {
		const urlSerializer = new DefaultUrlSerializer();
		const urlTree: UrlTree = urlSerializer.parse(storyUrl);
		navigationParams = urlTree.queryParams as { navigation: string; navigationSlug: string };
	});

	it('should render the component', async () => {
		const { container } = await render(HomeStoryCardComponent, {
			inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams },
		});
		expect(container).toBeTruthy();
	});

	it('should display the story title', async () => {
		await render(HomeStoryCardComponent, {
			inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams },
		});
		expect(screen.getByText(storyNavigationTeaserWithAuthorMock.title)).toBeInTheDocument();
	});

	it('should display the approximate reading time', async () => {
		await render(HomeStoryCardComponent, {
			inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams },
		});
		expect(
			screen.getByText(`${storyNavigationTeaserWithAuthorMock.approximateReadingTime} minutos de lectura`),
		).toBeInTheDocument();
	});

	it('should link to the story', async () => {
		await render(HomeStoryCardComponent, {
			inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams },
		});
		const link = screen.getAllByRole('link').find((l) => l.getAttribute('href')?.includes('/story/'));
		expect(link?.getAttribute('href')).toContain(storyUrl);
	});

	describe('Author', () => {
		it('should always display the author name and avatar', async () => {
			await render(HomeStoryCardComponent, {
				inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams },
			});
			expect(screen.getByText(storyNavigationTeaserWithAuthorMock.author.name)).toBeInTheDocument();
			expect(screen.getByTestId('author')).toBeInTheDocument();
		});

		it('should link the author photo and name to the author profile', async () => {
			await render(HomeStoryCardComponent, {
				inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams },
			});
			// La foto y el nombre del autor son un enlace propio a /author/:slug, elevado por encima del
			// enlace de la historia que se estira sobre toda la tarjeta.
			const link = screen.getAllByRole('link').find((l) => l.getAttribute('href')?.includes('/author/'));
			expect(link?.getAttribute('href')).toContain(authorUrl);
		});
	});

	describe('Order', () => {
		it('should display the order when provided', async () => {
			await render(HomeStoryCardComponent, {
				inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams, order: 7 },
			});
			expect(screen.getByTestId('order')).toHaveTextContent('7');
		});

		it('should display an order of 0 (not treated as absent)', async () => {
			await render(HomeStoryCardComponent, {
				inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams, order: 0 },
			});
			expect(screen.getByTestId('order')).toHaveTextContent('0');
		});

		it('should not display the order when not provided', async () => {
			await render(HomeStoryCardComponent, {
				inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams },
			});
			expect(screen.queryByTestId('order')).not.toBeInTheDocument();
		});
	});

	describe('Cover image', () => {
		it('should render the cover image when a URL is provided', async () => {
			await render(HomeStoryCardComponent, {
				inputs: {
					story: storyNavigationTeaserWithAuthorMock,
					navigationParams,
					coverImageUrl: 'https://example.com/cover.jpg',
				},
			});
			expect(screen.getByTestId('cover-image')).toBeInTheDocument();
		});

		it('should render a placeholder when no cover URL is provided', async () => {
			await render(HomeStoryCardComponent, {
				inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams },
			});
			expect(screen.getByTestId('cover-placeholder')).toBeInTheDocument();
		});
	});

	// El detalle de agrupación, contador y emisión vive en story-media-selectors.component.spec.ts.
	// Aquí solo se verifica la integración: que la tarjeta delegue en el componente cuando corresponde.
	describe('Multimedia selectors', () => {
		const richMedia: Media[] = [
			{ title: 'Video 1', type: 'youTubeVideo', description: [], data: { videoId: 'a' } },
			{ title: 'Podcast', type: 'spotifyPodcastEpisode', description: [], data: { url: 'https://spotify.com' } },
		];
		const storyWithMedia: StoryTeaserWithAuthor = { ...storyTeaserMock, author: authorTeaserMock, media: richMedia };

		it('should display the multimedia selectors when showMultimedia is true and there is media', async () => {
			await render(HomeStoryCardComponent, {
				inputs: { story: storyWithMedia, showMultimedia: true },
			});
			expect(screen.getByTestId('media')).toBeInTheDocument();
		});

		it('should not display the multimedia selectors when showMultimedia is false', async () => {
			await render(HomeStoryCardComponent, {
				inputs: { story: storyWithMedia, showMultimedia: false },
			});
			expect(screen.queryByTestId('media')).not.toBeInTheDocument();
		});

		it('should not display the multimedia selectors when the story has no media', async () => {
			await render(HomeStoryCardComponent, {
				inputs: { story: { ...storyWithMedia, media: [] }, showMultimedia: true },
			});
			expect(screen.queryByTestId('media')).not.toBeInTheDocument();
		});
	});

	describe('Tag label', () => {
		it('should display the tag label when provided', async () => {
			await render(HomeStoryCardComponent, {
				inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams, tagLabel: 'Cuento' },
			});
			expect(screen.getByText('Cuento')).toBeInTheDocument();
		});

		it('should not display the tag label when not provided', async () => {
			await render(HomeStoryCardComponent, {
				inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams },
			});
			expect(screen.queryByText('Cuento')).not.toBeInTheDocument();
		});
	});

	describe('Loading state', () => {
		it('should render the skeleton when no story is provided', async () => {
			await render(HomeStoryCardComponent, {
				inputs: { story: undefined },
			});
			expect(screen.getByTestId('skeleton')).toBeInTheDocument();
		});

		it('should not render the skeleton when a story is provided', async () => {
			await render(HomeStoryCardComponent, {
				inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams },
			});
			expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
		});
	});
});
