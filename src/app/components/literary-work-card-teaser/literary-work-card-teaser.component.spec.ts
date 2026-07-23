import { LiteraryWorkCardTeaserComponent } from './literary-work-card-teaser.component';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import {
	literaryWorkNavigationTeaserWithAuthorsFixtureMock,
	literaryWorkTeaserFixtureMock,
} from './literary-work-card-teaser.mock';
import { clearAllMocks } from '@test-utils';

describe('LiteraryWorkCardTeaserComponent', () => {
	const workUrl = '/read/el-espejo-del-tiempo?navigation=author&navigationSlug=francois-onoff';
	const authorUrl = '/author/francois-onoff';

	let navigationParams: { navigation: string; navigationSlug: string } = { navigation: '', navigationSlug: '' };

	beforeEach(() => {
		clearAllMocks();
		const urlSerializer = new DefaultUrlSerializer();
		const urlTree: UrlTree = urlSerializer.parse(workUrl);
		navigationParams = urlTree.queryParams as { navigation: string; navigationSlug: string };
	});

	it('should render the component', async () => {
		const { container } = await render(LiteraryWorkCardTeaserComponent, {
			inputs: { literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock, navigationParams },
		});
		expect(container).toBeTruthy();
	});

	it('should display the literary work title', async () => {
		await render(LiteraryWorkCardTeaserComponent, {
			inputs: { literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock, navigationParams },
		});
		expect(screen.getByText(literaryWorkNavigationTeaserWithAuthorsFixtureMock.title)).toBeInTheDocument();
	});

	it('should display the total reading time', async () => {
		await render(LiteraryWorkCardTeaserComponent, {
			inputs: { literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock, navigationParams },
		});
		expect(
			screen.getByText(`${literaryWorkNavigationTeaserWithAuthorsFixtureMock.totalReadingTime} minutos de lectura`),
		).toBeInTheDocument();
	});

	it('should link to the literary work reading page', async () => {
		await render(LiteraryWorkCardTeaserComponent, {
			inputs: { literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock, navigationParams },
		});
		const link = screen.getAllByRole('link').find((l) => l.getAttribute('href')?.includes('/read/'));
		expect(link?.getAttribute('href')).toContain(workUrl);
	});

	describe('Order', () => {
		it('should display the order without leading zero in row variants', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: {
					literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock,
					navigationParams,
					order: 3,
					variant: 'on-white',
				},
			});
			expect(screen.getByText('3.')).toBeInTheDocument();
		});

		it('should not display the order when not provided', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock, navigationParams },
			});
			expect(screen.queryByText('3.')).not.toBeInTheDocument();
		});

		it('should display an order of 0 (not treated as absent)', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: {
					literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock,
					navigationParams,
					order: 0,
					variant: 'on-white',
				},
			});
			expect(screen.getByText('0.')).toBeInTheDocument();
		});
	});

	describe('Authors', () => {
		it('should display every author of the byline when showAuthor is true', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: {
					literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock,
					navigationParams,
					showAuthor: true,
				},
			});
			// La fixture trae 2 autores para ejercitar la autoría 1..N.
			expect(screen.getAllByTestId('author')).toHaveLength(
				literaryWorkNavigationTeaserWithAuthorsFixtureMock.authors.length,
			);
			for (const author of literaryWorkNavigationTeaserWithAuthorsFixtureMock.authors) {
				expect(screen.getByText(author.name)).toBeInTheDocument();
			}
		});

		it('should link each author photo and name to its author profile', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: {
					literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock,
					navigationParams,
					showAuthor: true,
				},
			});
			// El bloque de cada autor (foto + nombre) es un enlace propio a /author/:slug, elevado por encima
			// del enlace de la obra que se estira sobre toda la tarjeta.
			const link = screen.getAllByRole('link').find((l) => l.getAttribute('href')?.includes('/author/'));
			expect(link?.getAttribute('href')).toContain(authorUrl);
		});

		it('should expose the author name as the accessible name of each author link', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: {
					literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock,
					navigationParams,
					showAuthor: true,
				},
			});
			// El avatar es decorativo (alt vacío): el nombre accesible de cada enlace es solo el del autor.
			for (const author of literaryWorkNavigationTeaserWithAuthorsFixtureMock.authors) {
				expect(screen.getByRole('link', { name: author.name })).toBeInTheDocument();
			}
		});

		it('should not display the authors when showAuthor is false', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: {
					literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock,
					navigationParams,
					showAuthor: false,
				},
			});
			expect(screen.queryByTestId('author')).not.toBeInTheDocument();
		});
	});

	describe('Cover image', () => {
		it('should render the cover image when the literary work has a cover', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkTeaserFixtureMock, navigationParams },
			});
			expect(screen.getByTestId('cover-image')).toBeInTheDocument();
		});

		it('should render a placeholder when the literary work has no cover', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock, navigationParams },
			});
			expect(screen.getByTestId('cover-placeholder')).toBeInTheDocument();
		});

		it('should keep the cover decorative, leaving a single accessible work link when the author is hidden', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkTeaserFixtureMock, navigationParams, showAuthor: false },
			});
			// El cover se renderiza como target visual (el click se delega al enlace estirado de la obra),
			// pero no es un enlace propio: con la autoría oculta queda un único enlace accesible, el de la obra.
			expect(screen.getByTestId('cover-image')).toBeInTheDocument();
			const links = screen.getAllByRole('link');
			expect(links).toHaveLength(1);
			expect(links[0]).toHaveAttribute('href', expect.stringContaining('/read/'));
		});
	});

	describe('Description', () => {
		it('should display the description when showExcerpt is true and the view carries a teaser section', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkTeaserFixtureMock, showExcerpt: true, excerptLines: 2 },
			});
			expect(screen.getByTestId('description')).toBeInTheDocument();
		});

		it('should render the teaser section HTML as the description content', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkTeaserFixtureMock, showExcerpt: true },
			});
			expect(screen.getByTestId('description')).toHaveTextContent('Al cruzar la primera frontera');
		});

		it('should not display the description when showExcerpt is false', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkTeaserFixtureMock, showExcerpt: false },
			});
			expect(screen.queryByTestId('description')).not.toBeInTheDocument();
		});

		it('should not display the description for a navigation teaser (no teaser section)', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock, showExcerpt: true },
			});
			expect(screen.queryByTestId('description')).not.toBeInTheDocument();
		});

		it('should apply the configured number of excerpt lines', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkTeaserFixtureMock, showExcerpt: true, excerptLines: 3 },
			});
			expect(screen.getByTestId('description')).toHaveClass('line-clamp-3');
		});

		it('should clamp excerptLines to the supported range (1-10)', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkTeaserFixtureMock, showExcerpt: true, excerptLines: 99 },
			});
			expect(screen.getByTestId('description')).toHaveClass('line-clamp-10');
		});
	});

	describe('Tag label', () => {
		it('should display the tag label when provided', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: {
					literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock,
					navigationParams,
					tagLabel: 'Cuento',
				},
			});
			expect(screen.getByText('Cuento')).toBeInTheDocument();
		});

		it('should not display the tag label when not provided', async () => {
			await render(LiteraryWorkCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock, navigationParams },
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
				inputs: { literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock, navigationParams },
			});
			expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
		});
	});
});
