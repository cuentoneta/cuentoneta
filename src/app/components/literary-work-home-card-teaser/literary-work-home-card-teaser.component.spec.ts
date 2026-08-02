import { LiteraryWorkHomeCardTeaserComponent } from './literary-work-home-card-teaser.component';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import {
	onoffLiteraryWorkTeasersMock,
	palacioNueveFronterasLiteraryWorkTeaserMock,
} from '@mocks/onoff-literary-work-teasers.mock';
import { clearAllMocks } from '@test-utils';
import type { Media } from '@models/media.model';
import type { LiteraryWorkTeaser } from '@models/literary-work.model';
import type { NavigationParams } from '@app-utils/navigation-params';

describe('LiteraryWorkHomeCardTeaserComponent', () => {
	const literaryWorkUrl = '/story/el-palacio-de-las-nueve-fronteras?navigation=author&navigationSlug=francois-onoff';
	const authorUrl = '/author/francois-onoff';

	let navigationParams: NavigationParams = { navigation: 'author', navigationSlug: '' };

	beforeEach(() => {
		clearAllMocks();
		const urlSerializer = new DefaultUrlSerializer();
		const urlTree: UrlTree = urlSerializer.parse(literaryWorkUrl);
		navigationParams = urlTree.queryParams as NavigationParams;
	});

	it('should render the component', async () => {
		const { container } = await render(LiteraryWorkHomeCardTeaserComponent, {
			inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams },
		});
		expect(container).toBeTruthy();
	});

	it('should display the literary work title', async () => {
		await render(LiteraryWorkHomeCardTeaserComponent, {
			inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams },
		});
		expect(screen.getByText(palacioNueveFronterasLiteraryWorkTeaserMock.title)).toBeInTheDocument();
	});

	it('should display the total reading time', async () => {
		await render(LiteraryWorkHomeCardTeaserComponent, {
			inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams },
		});
		expect(
			screen.getByText(`${palacioNueveFronterasLiteraryWorkTeaserMock.totalReadingTime} minutos de lectura`),
		).toBeInTheDocument();
	});

	it('should link to the literary work', async () => {
		await render(LiteraryWorkHomeCardTeaserComponent, {
			inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams },
		});
		const link = screen.getAllByRole('link').find((l) => l.getAttribute('href')?.includes('/story/'));
		expect(link?.getAttribute('href')).toContain(literaryWorkUrl);
	});

	describe('Author', () => {
		it('should always display the author name and avatar', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams },
			});
			expect(screen.getByText(palacioNueveFronterasLiteraryWorkTeaserMock.authors[0].name)).toBeInTheDocument();
			expect(screen.getByTestId('author')).toBeInTheDocument();
		});

		it('should link the author photo and name to the author profile', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams },
			});
			// La foto y el nombre del autor son un enlace propio a /author/:slug, elevado por encima del
			// enlace de la obra que se estira sobre toda la tarjeta.
			const link = screen.getAllByRole('link').find((l) => l.getAttribute('href')?.includes('/author/'));
			expect(link?.getAttribute('href')).toContain(authorUrl);
		});

		it('should expose the author name as the accessible name of the author link', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams },
			});
			// El avatar es decorativo (alt vacío): el nombre accesible del enlace es solo el nombre del autor.
			expect(
				screen.getByRole('link', { name: palacioNueveFronterasLiteraryWorkTeaserMock.authors[0].name }),
			).toBeInTheDocument();
		});
	});

	describe('Order', () => {
		it('should display the order when provided', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams, order: 7 },
			});
			expect(screen.getByTestId('order')).toHaveTextContent('7');
		});

		it('should display an order of 0 (not treated as absent)', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams, order: 0 },
			});
			expect(screen.getByTestId('order')).toHaveTextContent('0');
		});

		it('should not display the order when not provided', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams },
			});
			expect(screen.queryByTestId('order')).not.toBeInTheDocument();
		});
	});

	describe('Cover image', () => {
		it('should render the cover image when the literary work has a cover', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: {
					literaryWork: { ...palacioNueveFronterasLiteraryWorkTeaserMock, coverImage: 'https://example.com/cover.jpg' },
					navigationParams,
				},
			});
			expect(screen.getByTestId('cover-image')).toBeInTheDocument();
		});

		it('should render a placeholder when the literary work has no cover', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: {
					literaryWork: { ...palacioNueveFronterasLiteraryWorkTeaserMock, coverImage: '' },
					navigationParams,
				},
			});
			expect(screen.getByTestId('cover-placeholder')).toBeInTheDocument();
		});
	});

	// El detalle de agrupación, contador y emisión vive en media-selectors.component.spec.ts.
	// Aquí solo se verifica la integración: que la tarjeta delegue en el componente cuando corresponde.
	describe('Multimedia selectors', () => {
		const richMedia: Media[] = [
			{ title: 'Video 1', type: 'youTubeVideo', description: [], data: { videoId: 'a' } },
			{ title: 'Podcast', type: 'spotifyPodcastEpisode', description: [], data: { url: 'https://spotify.com' } },
		];
		const literaryWorkWithMedia: LiteraryWorkTeaser = {
			...palacioNueveFronterasLiteraryWorkTeaserMock,
			mediaSources: richMedia,
		};

		it('should display the multimedia selectors when showMultimedia is true and there is media', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkWithMedia, showMultimedia: true },
			});
			expect(screen.getByTestId('media')).toBeInTheDocument();
		});

		it('should not display the multimedia selectors when showMultimedia is false', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkWithMedia, showMultimedia: false },
			});
			expect(screen.queryByTestId('media')).not.toBeInTheDocument();
		});

		it('should not display the multimedia selectors when the literary work has no media', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: { literaryWork: { ...literaryWorkWithMedia, mediaSources: [] }, showMultimedia: true },
			});
			expect(screen.queryByTestId('media')).not.toBeInTheDocument();
		});
	});

	describe('Tag label', () => {
		it('should display the tag label when provided', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams, tagLabel: 'Cuento' },
			});
			expect(screen.getByText('Cuento')).toBeInTheDocument();
		});

		it('should not display the tag label when not provided', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams },
			});
			expect(screen.queryByText('Cuento')).not.toBeInTheDocument();
		});
	});

	describe('Loading state', () => {
		it('should render the skeleton when no literary work is provided', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: { literaryWork: undefined },
			});
			expect(screen.getByTestId('skeleton')).toBeInTheDocument();
		});

		it('should not render the skeleton when a literary work is provided', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams },
			});
			expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
		});
	});

	// Variedad de obras reales del corpus de François Onoff: detecta regresiones de datos del corpus.
	describe('Onoff corpus — literary work variety', () => {
		beforeEach(() => clearAllMocks());

		it.each(onoffLiteraryWorkTeasersMock)('should render title and reading time for "$title"', async (teaser) => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: { literaryWork: teaser },
			});

			expect(screen.getByText(teaser.title)).toBeInTheDocument();
			expect(screen.getByText(`${teaser.totalReadingTime} minutos de lectura`)).toBeInTheDocument();
		});
	});
});
