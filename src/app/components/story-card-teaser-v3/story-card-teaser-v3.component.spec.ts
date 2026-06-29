import { StoryCardTeaserV3Component } from './story-card-teaser-v3.component';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { storyNavigationTeaserWithAuthorMock, storyTeaserMock } from '../../mocks/story.mock';
import { authorTeaserMock } from '../../mocks/author.mock';
import { onoffStoryTeasersMock, palacioNueveFronterasTeaserMock } from '../../mocks/onoff-story-teasers.mock';
import { clearAllMocks } from '@test-utils';
import type { Media } from '@models/media.model';
import type { StoryTeaserWithAuthor } from '@models/story.model';

describe('StoryCardTeaserV3Component', () => {
	const storyUrl = '/story/el-espejo-del-tiempo?navigation=author&navigationSlug=francois-onoff';
	const authorUrl = '/author/francois-onoff';

	let navigationParams: { navigation: string; navigationSlug: string } = { navigation: '', navigationSlug: '' };

	beforeEach(() => {
		clearAllMocks();
		const urlSerializer = new DefaultUrlSerializer();
		const urlTree: UrlTree = urlSerializer.parse(storyUrl);
		navigationParams = urlTree.queryParams as { navigation: string; navigationSlug: string };
	});

	it('should render the component', async () => {
		const { container } = await render(StoryCardTeaserV3Component, {
			inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams },
		});
		expect(container).toBeTruthy();
	});

	it('should display the story title', async () => {
		await render(StoryCardTeaserV3Component, {
			inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams },
		});
		expect(screen.getByText(storyNavigationTeaserWithAuthorMock.title)).toBeInTheDocument();
	});

	it('should display the approximate reading time', async () => {
		await render(StoryCardTeaserV3Component, {
			inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams },
		});
		expect(
			screen.getByText(`${storyNavigationTeaserWithAuthorMock.approximateReadingTime} minutos de lectura`),
		).toBeInTheDocument();
	});

	it('should link to the story', async () => {
		await render(StoryCardTeaserV3Component, {
			inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams },
		});
		const link = screen.getAllByRole('link').find((l) => l.getAttribute('href')?.includes('/story/'));
		expect(link?.getAttribute('href')).toContain(storyUrl);
	});

	describe('Order', () => {
		it('should display the order without leading zero in row variants', async () => {
			await render(StoryCardTeaserV3Component, {
				inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams, order: 3, variant: 'on-white' },
			});
			expect(screen.getByText('3.')).toBeInTheDocument();
		});

		it('should not display the order when not provided', async () => {
			await render(StoryCardTeaserV3Component, {
				inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams },
			});
			expect(screen.queryByText('3.')).not.toBeInTheDocument();
		});

		it('should display an order of 0 (not treated as absent)', async () => {
			await render(StoryCardTeaserV3Component, {
				inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams, order: 0, variant: 'on-white' },
			});
			expect(screen.getByText('0.')).toBeInTheDocument();
		});
	});

	describe('Author', () => {
		it('should display the author name and avatar when showAuthor is true', async () => {
			await render(StoryCardTeaserV3Component, {
				inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams, showAuthor: true },
			});
			expect(screen.getByText(storyNavigationTeaserWithAuthorMock.author.name)).toBeInTheDocument();
			expect(screen.getByTestId('author')).toBeInTheDocument();
		});

		it('should link the author photo and name to the author profile', async () => {
			await render(StoryCardTeaserV3Component, {
				inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams, showAuthor: true },
			});
			// El bloque del autor (foto + nombre) es un enlace propio a /author/:slug, elevado por encima del
			// enlace de la historia que se estira sobre toda la tarjeta.
			const link = screen.getAllByRole('link').find((l) => l.getAttribute('href')?.includes('/author/'));
			expect(link?.getAttribute('href')).toContain(authorUrl);
		});

		it('should not display the author when showAuthor is false', async () => {
			await render(StoryCardTeaserV3Component, {
				inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams, showAuthor: false },
			});
			expect(screen.queryByTestId('author')).not.toBeInTheDocument();
		});
	});

	describe('Cover image', () => {
		it('should render the cover image when a URL is provided', async () => {
			await render(StoryCardTeaserV3Component, {
				inputs: {
					story: storyNavigationTeaserWithAuthorMock,
					navigationParams,
					coverImageUrl: 'https://example.com/cover.jpg',
				},
			});
			expect(screen.getByTestId('cover-image')).toBeInTheDocument();
		});

		it('should render a placeholder when no cover URL is provided', async () => {
			await render(StoryCardTeaserV3Component, {
				inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams },
			});
			expect(screen.getByTestId('cover-placeholder')).toBeInTheDocument();
		});

		it('should keep the cover decorative, leaving a single accessible story link when the author is hidden', async () => {
			await render(StoryCardTeaserV3Component, {
				inputs: {
					story: storyNavigationTeaserWithAuthorMock,
					navigationParams,
					coverImageUrl: 'https://example.com/cover.jpg',
					showAuthor: false,
				},
			});
			// El cover se renderiza como target visual (el click se delega al enlace estirado de la historia),
			// pero no es un enlace propio: con el autor oculto queda un único enlace accesible, el de la historia.
			expect(screen.getByTestId('cover-image')).toBeInTheDocument();
			const links = screen.getAllByRole('link');
			expect(links).toHaveLength(1);
			expect(links[0]).toHaveAttribute('href', expect.stringContaining('/story/'));
		});
	});

	describe('Description', () => {
		const storyWithParagraphs = palacioNueveFronterasTeaserMock;

		it('should display the description when showExcerpt is true and there are paragraphs', async () => {
			await render(StoryCardTeaserV3Component, {
				inputs: { story: storyWithParagraphs, showExcerpt: true, excerptLines: 2 },
			});
			expect(screen.getByTestId('description')).toBeInTheDocument();
		});

		it('should not display the description when showExcerpt is false', async () => {
			await render(StoryCardTeaserV3Component, {
				inputs: { story: storyWithParagraphs, showExcerpt: false },
			});
			expect(screen.queryByTestId('description')).not.toBeInTheDocument();
		});

		it('should apply the configured number of excerpt lines', async () => {
			await render(StoryCardTeaserV3Component, {
				inputs: { story: storyWithParagraphs, showExcerpt: true, excerptLines: 3 },
			});
			expect(screen.getByTestId('description')).toHaveClass('line-clamp-3');
		});

		it('should clamp excerptLines to the supported range (1-10)', async () => {
			await render(StoryCardTeaserV3Component, {
				inputs: { story: storyWithParagraphs, showExcerpt: true, excerptLines: 99 },
			});
			expect(screen.getByTestId('description')).toHaveClass('line-clamp-10');
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
			await render(StoryCardTeaserV3Component, {
				inputs: { story: storyWithMedia, showMultimedia: true },
			});
			expect(screen.getByTestId('media')).toBeInTheDocument();
		});

		it('should not display the multimedia selectors when showMultimedia is false', async () => {
			await render(StoryCardTeaserV3Component, {
				inputs: { story: storyWithMedia, showMultimedia: false },
			});
			expect(screen.queryByTestId('media')).not.toBeInTheDocument();
		});

		it('should not display the multimedia selectors when the story has no media', async () => {
			await render(StoryCardTeaserV3Component, {
				inputs: { story: { ...storyWithMedia, media: [] }, showMultimedia: true },
			});
			expect(screen.queryByTestId('media')).not.toBeInTheDocument();
		});
	});

	describe('Tag label', () => {
		it('should display the tag label when provided', async () => {
			await render(StoryCardTeaserV3Component, {
				inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams, tagLabel: 'Cuento' },
			});
			expect(screen.getByText('Cuento')).toBeInTheDocument();
		});

		it('should not display the tag label when not provided', async () => {
			await render(StoryCardTeaserV3Component, {
				inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams },
			});
			expect(screen.queryByText('Cuento')).not.toBeInTheDocument();
		});
	});

	describe('Loading state', () => {
		it('should render the skeleton when no story is provided', async () => {
			await render(StoryCardTeaserV3Component, {
				inputs: { story: undefined, variant: 'on-white' },
			});
			expect(screen.getByTestId('skeleton')).toBeInTheDocument();
		});

		it('should not render the skeleton when a story is provided', async () => {
			await render(StoryCardTeaserV3Component, {
				inputs: { story: storyNavigationTeaserWithAuthorMock, navigationParams },
			});
			expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
		});
	});

	// Variedad de obras reales del corpus de François Onoff (#1650): detecta regresiones de datos del corpus.
	describe('Corpus Onoff — variedad de obras', () => {
		it.each(onoffStoryTeasersMock)('should render title and reading time for "$title"', async (teaser) => {
			await render(StoryCardTeaserV3Component, {
				inputs: { story: teaser, coverImageUrl: teaser.coverImage },
			});

			expect(screen.getByText(teaser.title)).toBeInTheDocument();
			expect(screen.getByText(`${teaser.approximateReadingTime} minutos de lectura`)).toBeInTheDocument();
		});
	});
});
