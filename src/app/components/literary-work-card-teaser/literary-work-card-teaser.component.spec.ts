import { LiteraryWorkCardTeaserComponent } from './literary-work-card-teaser.component';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import {
	onoffLiteraryWorkTeasersMock,
	palacioNueveFronterasLiteraryWorkTeaserMock,
} from '@mocks/onoff-literary-work-teasers.mock';
import { clearAllMocks } from '@test-utils';
import type { Media } from '@models/media.model';
import type { LiteraryWorkTeaser } from '@models/literary-work.model';

describe('LiteraryWorkCardTeaserComponent', () => {
	const literaryWorkUrl = '/story/el-palacio-de-las-nueve-fronteras?navigation=author&navigationSlug=francois-onoff';
	const authorUrl = '/author/francois-onoff';

	let navigationParams: { navigation: string; navigationSlug: string } = { navigation: '', navigationSlug: '' };

	beforeEach(() => {
		clearAllMocks();
		const urlSerializer = new DefaultUrlSerializer();
		const urlTree: UrlTree = urlSerializer.parse(literaryWorkUrl);
		navigationParams = urlTree.queryParams as { navigation: string; navigationSlug: string };
	});

	it('should render the component', async () => {
		const { container } = await render(LiteraryWorkCardTeaserComponent, {
			inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams },
		});
		expect(container).toBeTruthy();
	});

	it('should display the literary work title', async () => {
		await render(LiteraryWorkCardTeaserComponent, {
			inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams },
		});
		expect(screen.getByText(palacioNueveFronterasLiteraryWorkTeaserMock.title)).toBeInTheDocument();
	});

	it('should display the total reading time', async () => {
		await render(LiteraryWorkCardTeaserComponent, {
			inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams },
		});
		expect(
			screen.getByText(`${palacioNueveFronterasLiteraryWorkTeaserMock.totalReadingTime} minutos de lectura`),
		).toBeInTheDocument();
	});

	it('should link to the literary work', async () => {
		await render(LiteraryWorkCardTeaserComponent, {
			inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams },
		});
		const link = screen.getAllByRole('link').find((l) => l.getAttribute('href')?.includes('/story/'));
		expect(link?.getAttribute('href')).toContain(literaryWorkUrl);
	});

	describe('Order', () => {
		it('should display the order without leading zero in row variants', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: {
					literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock,
					navigationParams,
					order: 3,
					variant: 'on-white',
				},
			});
			expect(screen.getByText('3.')).toBeInTheDocument();
		});

		it('should not display the order when not provided', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams },
			});
			expect(screen.queryByText('3.')).not.toBeInTheDocument();
		});

		it('should display an order of 0 (not treated as absent)', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: {
					literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock,
					navigationParams,
					order: 0,
					variant: 'on-white',
				},
			});
			expect(screen.getByText('0.')).toBeInTheDocument();
		});
	});

	describe('Author', () => {
		it('should display the author name and avatar when showAuthor is true', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams, showAuthor: true },
			});
			expect(screen.getByText(palacioNueveFronterasLiteraryWorkTeaserMock.authors[0].name)).toBeInTheDocument();
			expect(screen.getByTestId('author')).toBeInTheDocument();
		});

		it('should link the author photo and name to the author profile', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams, showAuthor: true },
			});
			// El bloque del autor (foto + nombre) es un enlace propio a /author/:slug, elevado por encima del
			// enlace de la obra que se estira sobre toda la tarjeta.
			const link = screen.getAllByRole('link').find((l) => l.getAttribute('href')?.includes('/author/'));
			expect(link?.getAttribute('href')).toContain(authorUrl);
		});

		it('should expose the author name as the accessible name of the author link', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams, showAuthor: true },
			});
			// El avatar es decorativo (alt vacío): el nombre accesible del enlace es solo el nombre del autor.
			expect(
				screen.getByRole('link', { name: palacioNueveFronterasLiteraryWorkTeaserMock.authors[0].name }),
			).toBeInTheDocument();
		});

		it('should not display the author when showAuthor is false', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams, showAuthor: false },
			});
			expect(screen.queryByTestId('author')).not.toBeInTheDocument();
		});
	});

	describe('Cover image', () => {
		it('should render the cover image when the literary work has a cover', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: {
					literaryWork: { ...palacioNueveFronterasLiteraryWorkTeaserMock, coverImage: 'https://example.com/cover.jpg' },
					navigationParams,
				},
			});
			expect(screen.getByTestId('cover-image')).toBeInTheDocument();
		});

		it('should render a placeholder when the literary work has no cover', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: {
					literaryWork: { ...palacioNueveFronterasLiteraryWorkTeaserMock, coverImage: '' },
					navigationParams,
				},
			});
			expect(screen.getByTestId('cover-placeholder')).toBeInTheDocument();
		});

		it('should keep the cover decorative, leaving a single accessible literary work link when the author is hidden', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: {
					literaryWork: { ...palacioNueveFronterasLiteraryWorkTeaserMock, coverImage: 'https://example.com/cover.jpg' },
					navigationParams,
					showAuthor: false,
				},
			});
			// El cover se renderiza como target visual (el click se delega al enlace estirado de la obra),
			// pero no es un enlace propio: con el autor oculto queda un único enlace accesible, el de la obra.
			expect(screen.getByTestId('cover-image')).toBeInTheDocument();
			const links = screen.getAllByRole('link');
			expect(links).toHaveLength(1);
			expect(links[0]).toHaveAttribute('href', expect.stringContaining('/story/'));
		});
	});

	describe('Description', () => {
		// El teaser expone la primera sección completa (teaserSection) con el cuerpo ya saneado a HTML.
		const literaryWorkWithExcerpt: LiteraryWorkTeaser = palacioNueveFronterasLiteraryWorkTeaserMock;

		it('should display the description when showExcerpt is true and there is a teaser section', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkWithExcerpt, showExcerpt: true, excerptLines: 2 },
			});
			expect(screen.getByTestId('description')).toBeInTheDocument();
		});

		it('should render the sanitized section body inside the excerpt', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkWithExcerpt, showExcerpt: true },
			});
			// El excerpt pinta teaserSection.bodyHtml (HTML saneado) vía [innerHTML]: el elemento debe quedar
			// con el cuerpo renderizado en el DOM (no vacío), tras dejar de usar PortableTextParser.
			expect(screen.getByTestId('description')).not.toBeEmptyDOMElement();
		});

		it('should not display the description when showExcerpt is false', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkWithExcerpt, showExcerpt: false },
			});
			expect(screen.queryByTestId('description')).not.toBeInTheDocument();
		});

		it('should apply the configured number of excerpt lines', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkWithExcerpt, showExcerpt: true, excerptLines: 3 },
			});
			expect(screen.getByTestId('description')).toHaveClass('line-clamp-3');
		});

		it('should clamp excerptLines to the supported range (1-10)', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkWithExcerpt, showExcerpt: true, excerptLines: 99 },
			});
			expect(screen.getByTestId('description')).toHaveClass('line-clamp-10');
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
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkWithMedia, showMultimedia: true },
			});
			expect(screen.getByTestId('media')).toBeInTheDocument();
		});

		it('should not display the multimedia selectors when showMultimedia is false', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkWithMedia, showMultimedia: false },
			});
			expect(screen.queryByTestId('media')).not.toBeInTheDocument();
		});

		it('should not display the multimedia selectors when the literary work has no media', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: { ...literaryWorkWithMedia, mediaSources: [] }, showMultimedia: true },
			});
			expect(screen.queryByTestId('media')).not.toBeInTheDocument();
		});
	});

	describe('Tag label', () => {
		it('should display the tag label when provided', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams, tagLabel: 'Cuento' },
			});
			expect(screen.getByText('Cuento')).toBeInTheDocument();
		});

		it('should not display the tag label when not provided', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams },
			});
			expect(screen.queryByText('Cuento')).not.toBeInTheDocument();
		});
	});

	describe('Loading state', () => {
		it('should render the skeleton when no literary work is provided', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: undefined, variant: 'on-white' },
			});
			expect(screen.getByTestId('skeleton')).toBeInTheDocument();
		});

		it('should not render the skeleton when a literary work is provided', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: palacioNueveFronterasLiteraryWorkTeaserMock, navigationParams },
			});
			expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
		});
	});

	// Variedad de obras reales del corpus de François Onoff: detecta regresiones de datos del corpus.
	describe('Onoff corpus — literary work variety', () => {
		beforeEach(() => clearAllMocks());

		it.each(onoffLiteraryWorkTeasersMock)('should render title and reading time for "$title"', async (teaser) => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: teaser },
			});

			expect(screen.getByText(teaser.title)).toBeInTheDocument();
			expect(screen.getByText(`${teaser.totalReadingTime} minutos de lectura`)).toBeInTheDocument();
		});
	});
});
