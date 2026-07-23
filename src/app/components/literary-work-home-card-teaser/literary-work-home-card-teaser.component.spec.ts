import { LiteraryWorkHomeCardTeaserComponent } from './literary-work-home-card-teaser.component';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import {
	literaryWorkNavigationTeaserWithAuthorsFixtureMock,
	literaryWorkTeaserFixtureMock,
} from './literary-work-home-card-teaser.mock';
import { clearAllMocks } from '@test-utils';

describe('LiteraryWorkHomeCardTeaserComponent', () => {
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
		const { container } = await render(LiteraryWorkHomeCardTeaserComponent, {
			inputs: { literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock, navigationParams },
		});
		expect(container).toBeTruthy();
	});

	it('should display the literary work title', async () => {
		await render(LiteraryWorkHomeCardTeaserComponent, {
			inputs: { literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock, navigationParams },
		});
		expect(screen.getByText(literaryWorkNavigationTeaserWithAuthorsFixtureMock.title)).toBeInTheDocument();
	});

	it('should display the total reading time', async () => {
		await render(LiteraryWorkHomeCardTeaserComponent, {
			inputs: { literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock, navigationParams },
		});
		expect(
			screen.getByText(`${literaryWorkNavigationTeaserWithAuthorsFixtureMock.totalReadingTime} minutos de lectura`),
		).toBeInTheDocument();
	});

	it('should link to the literary work reading page', async () => {
		await render(LiteraryWorkHomeCardTeaserComponent, {
			inputs: { literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock, navigationParams },
		});
		const link = screen.getAllByRole('link').find((l) => l.getAttribute('href')?.includes('/read/'));
		expect(link?.getAttribute('href')).toContain(workUrl);
	});

	describe('Authors', () => {
		it('should display every author of the byline', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock, navigationParams },
			});
			// La fixture de navegación trae 2 autores para ejercitar la autoría 1..N.
			expect(screen.getAllByTestId('author')).toHaveLength(
				literaryWorkNavigationTeaserWithAuthorsFixtureMock.authors.length,
			);
			for (const author of literaryWorkNavigationTeaserWithAuthorsFixtureMock.authors) {
				expect(screen.getByText(author.name)).toBeInTheDocument();
			}
		});

		it('should link each author photo and name to its author profile', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock, navigationParams },
			});
			// El bloque de cada autor (foto + nombre) es un enlace propio a /author/:slug, elevado por encima
			// del enlace de la obra que se estira sobre toda la tarjeta.
			const link = screen.getAllByRole('link').find((l) => l.getAttribute('href')?.includes('/author/'));
			expect(link?.getAttribute('href')).toContain(authorUrl);
		});

		it('should expose the author name as the accessible name of each author link', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock, navigationParams },
			});
			// El avatar es decorativo (alt vacío): el nombre accesible de cada enlace es solo el del autor.
			for (const author of literaryWorkNavigationTeaserWithAuthorsFixtureMock.authors) {
				expect(screen.getByRole('link', { name: author.name })).toBeInTheDocument();
			}
		});
	});

	describe('Order', () => {
		it('should display the order when provided', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock, navigationParams, order: 7 },
			});
			expect(screen.getByTestId('order')).toHaveTextContent('7');
		});

		it('should display an order of 0 (not treated as absent)', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock, navigationParams, order: 0 },
			});
			expect(screen.getByTestId('order')).toHaveTextContent('0');
		});

		it('should not display the order when not provided', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock, navigationParams },
			});
			expect(screen.queryByTestId('order')).not.toBeInTheDocument();
		});
	});

	describe('Cover image', () => {
		it('should render the cover image when the literary work has a cover', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkTeaserFixtureMock, navigationParams },
			});
			expect(screen.getByTestId('cover-image')).toBeInTheDocument();
		});

		it('should render a placeholder when the literary work has no cover', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock, navigationParams },
			});
			expect(screen.getByTestId('cover-placeholder')).toBeInTheDocument();
		});
	});

	describe('Tag label', () => {
		it('should display the tag label when provided', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: {
					literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock,
					navigationParams,
					tagLabel: 'Cuento',
				},
			});
			expect(screen.getByText('Cuento')).toBeInTheDocument();
		});

		it('should not display the tag label when not provided', async () => {
			await render(LiteraryWorkHomeCardTeaserComponent, {
				inputs: { literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock, navigationParams },
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
				inputs: { literaryWork: literaryWorkNavigationTeaserWithAuthorsFixtureMock, navigationParams },
			});
			expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
		});
	});
});
