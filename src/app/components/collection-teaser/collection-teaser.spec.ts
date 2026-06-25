// Librería de pruebas
import { render, screen, within } from '@testing-library/angular';
import { provideRouter } from '@angular/router';

// Componentes
import { CollectionTeaser } from './collection-teaser';

// Mocks
import { storylistMock } from '@mocks/storylist.mock';

// Modelos
import { StorylistTeaser } from '@models/storylist.model';

// Utilidades de test
import { clearAllMocks } from '@test-utils';

const collectionTeaserMock: StorylistTeaser = {
	...storylistMock,
	stories: [],
	tabs: [],
};

const fanoutCoverImages = [
	'https://example.test/cover-a.jpg',
	'https://example.test/cover-b.jpg',
	'https://example.test/cover-c.jpg',
];

// Multiple: sin featuredImage y con 3 o más historias.
function teaserMultiple(coverImages: string[]): StorylistTeaser {
	return { ...collectionTeaserMock, featuredImage: '', count: 3, coverImages };
}

// Single derivado de stories: sin featuredImage y con menos de 3 historias.
function teaserSingleFromStories(coverImages: string[]): StorylistTeaser {
	return { ...collectionTeaserMock, featuredImage: '', count: 2, coverImages };
}

describe('CollectionTeaser', () => {
	const defaultProviders = [provideRouter([])];

	beforeEach(() => {
		clearAllMocks();
	});

	// Pruebas de renderizado básico
	describe('Renderizado del componente', () => {
		it('should render the component', async () => {
			const { container } = await render(CollectionTeaser, {
				inputs: { collection: collectionTeaserMock },
				providers: defaultProviders,
			});
			expect(container).toBeTruthy();
		});

		it('should render an article element', async () => {
			await render(CollectionTeaser, {
				inputs: { collection: collectionTeaserMock },
				providers: defaultProviders,
			});

			const article = screen.getByRole('article');
			expect(article).toBeInTheDocument();
		});

		it('should not render link when collection is undefined', async () => {
			await render(CollectionTeaser, {
				providers: defaultProviders,
			});

			// Solo debe existir el article vacío, sin link
			const article = screen.getByRole('article');
			expect(article).toBeInTheDocument();
			expect(screen.queryByRole('link')).not.toBeInTheDocument();
		});
	});

	// Pruebas del enlace de navegación
	describe('Enlace de navegación', () => {
		it('should render a link to the storylist page', async () => {
			await render(CollectionTeaser, {
				inputs: { collection: collectionTeaserMock },
				providers: defaultProviders,
			});

			const link = screen.getByRole('link');
			expect(link).toBeInTheDocument();
		});

		it('should have correct routerLink with storylist slug', async () => {
			await render(CollectionTeaser, {
				inputs: { collection: collectionTeaserMock },
				providers: defaultProviders,
			});

			const link = screen.getByRole('link');
			expect(link).toHaveAttribute('href', `/storylist/${collectionTeaserMock.slug}`);
		});

		it('should have navigation-link class', async () => {
			await render(CollectionTeaser, {
				inputs: { collection: collectionTeaserMock },
				providers: defaultProviders,
			});

			const link = screen.getByRole('link');
			expect(link).toHaveClass('navigation-link');
		});
	});

	// Pruebas del cover de la colección
	describe('Imagen de la colección', () => {
		it('should render the cover image', async () => {
			await render(CollectionTeaser, {
				inputs: { collection: collectionTeaserMock },
				providers: defaultProviders,
			});

			expect(screen.getByTestId('cover-image')).toBeInTheDocument();
		});

		it('should render a decorative cover with empty alt', async () => {
			await render(CollectionTeaser, {
				inputs: { collection: collectionTeaserMock },
				providers: defaultProviders,
			});

			expect(screen.getByTestId('cover-image')).toHaveAttribute('alt', '');
		});
	});

	// Selección de variante: featuredImage manda; sin ella, el abanico aparece con 3 o más historias.
	describe('Variante de portada', () => {
		it('should show featuredImage as a single cover even with 3+ stories and cover images', async () => {
			await render(CollectionTeaser, {
				inputs: { collection: { ...collectionTeaserMock, count: 5, coverImages: fanoutCoverImages } },
				providers: defaultProviders,
			});

			expect(screen.getAllByTestId('cover-image')).toHaveLength(1);
		});

		it('should render the fan of 3 covers when there is no featuredImage and 3+ stories', async () => {
			await render(CollectionTeaser, {
				inputs: { collection: teaserMultiple(fanoutCoverImages) },
				providers: defaultProviders,
			});

			expect(screen.getAllByTestId('cover-image')).toHaveLength(3);
		});

		it('should render 3 placeholders in the fan when no story has a cover image', async () => {
			await render(CollectionTeaser, {
				inputs: { collection: teaserMultiple([]) },
				providers: defaultProviders,
			});

			expect(screen.queryAllByTestId('cover-image')).toHaveLength(0);
			expect(screen.getAllByTestId('cover-placeholder')).toHaveLength(3);
		});

		it('should render a placeholder for an interior missing cover, preserving position', async () => {
			await render(CollectionTeaser, {
				inputs: { collection: teaserMultiple([fanoutCoverImages[0], '', fanoutCoverImages[2]]) },
				providers: defaultProviders,
			});

			expect(screen.getAllByTestId('cover-image')).toHaveLength(2);
			expect(screen.getByTestId('cover-placeholder')).toBeInTheDocument();
		});

		it('should place coverImages[0] as the front (last in DOM) cover', async () => {
			await render(CollectionTeaser, {
				inputs: { collection: teaserMultiple(fanoutCoverImages) },
				providers: defaultProviders,
			});

			const covers = screen.getAllByTestId('cover-image');
			expect(covers[covers.length - 1]).toHaveAttribute('src', expect.stringContaining(fanoutCoverImages[0]));
		});

		it('should render Single with the first available story cover when no featuredImage and fewer than 3 stories', async () => {
			await render(CollectionTeaser, {
				inputs: { collection: teaserSingleFromStories(['', fanoutCoverImages[1]]) },
				providers: defaultProviders,
			});

			const covers = screen.getAllByTestId('cover-image');
			expect(covers).toHaveLength(1);
			expect(covers[0]).toHaveAttribute('src', expect.stringContaining(fanoutCoverImages[1]));
		});

		it('should render the Single placeholder when no featuredImage, fewer than 3 stories and no cover images', async () => {
			await render(CollectionTeaser, {
				inputs: { collection: teaserSingleFromStories([]) },
				providers: defaultProviders,
			});

			expect(screen.queryAllByTestId('cover-image')).toHaveLength(0);
			expect(screen.getByTestId('cover-placeholder')).toBeInTheDocument();
		});
	});

	// Pruebas del título
	describe('Título de la colección', () => {
		it('should display the collection title', async () => {
			await render(CollectionTeaser, {
				inputs: { collection: collectionTeaserMock },
				providers: defaultProviders,
			});

			expect(screen.getByText(collectionTeaserMock.title)).toBeInTheDocument();
		});

		it('should render title inside the link', async () => {
			await render(CollectionTeaser, {
				inputs: { collection: collectionTeaserMock },
				providers: defaultProviders,
			});

			const link = screen.getByRole('link');
			expect(within(link).getByText(collectionTeaserMock.title)).toBeInTheDocument();
		});
	});

	// Pruebas del footer con tags y contador
	describe('Footer con tags y contador de historias', () => {
		it('should display the story count', async () => {
			await render(CollectionTeaser, {
				inputs: { collection: collectionTeaserMock },
				providers: defaultProviders,
			});

			expect(screen.getByText(`${collectionTeaserMock.count} historias`)).toBeInTheDocument();
		});

		it('should display the tags', async () => {
			await render(CollectionTeaser, {
				inputs: { collection: collectionTeaserMock },
				providers: defaultProviders,
			});

			// Verificar que al menos un tag se muestra
			const tagTitle = collectionTeaserMock.tags[0]?.title;
			if (tagTitle) {
				expect(screen.getByText(tagTitle, { exact: false })).toBeInTheDocument();
			}
		});
	});

	// Pruebas de inputs
	describe('Inputs del componente', () => {
		it('should accept a collection input', async () => {
			const { fixture } = await render(CollectionTeaser, {
				inputs: { collection: collectionTeaserMock },
				providers: defaultProviders,
			});

			expect(fixture.componentInstance.collection()).toEqual(collectionTeaserMock);
		});

		it('should have undefined collection by default', async () => {
			const { fixture } = await render(CollectionTeaser, {
				providers: defaultProviders,
			});

			expect(fixture.componentInstance.collection()).toBeUndefined();
		});

		it('should update when collection input changes', async () => {
			const { fixture } = await render(CollectionTeaser, {
				inputs: { collection: collectionTeaserMock },
				providers: defaultProviders,
			});

			const updatedCollection: StorylistTeaser = {
				...collectionTeaserMock,
				title: 'Nueva Colección',
				slug: 'nueva-coleccion',
			};

			fixture.componentRef.setInput('collection', updatedCollection);
			fixture.detectChanges();

			expect(screen.getByText('Nueva Colección')).toBeInTheDocument();
		});
	});

	// Pruebas de estructura del layout
	describe('Estructura del layout', () => {
		it('should have flex layout with gap on link', async () => {
			await render(CollectionTeaser, {
				inputs: { collection: collectionTeaserMock },
				providers: defaultProviders,
			});

			const link = screen.getByRole('link');
			expect(link).toHaveClass('flex');
			expect(link).toHaveClass('items-start');
			expect(link).toHaveClass('gap-5');
		});
	});

	// Pruebas de accesibilidad
	describe('Accesibilidad', () => {
		it('should have accessible link', async () => {
			await render(CollectionTeaser, {
				inputs: { collection: collectionTeaserMock },
				providers: defaultProviders,
			});

			const link = screen.getByRole('link');
			expect(link).toBeInTheDocument();
		});

		it('should have a decorative cover and the link named by the collection title', async () => {
			await render(CollectionTeaser, {
				inputs: { collection: collectionTeaserMock },
				providers: defaultProviders,
			});

			// El cover es decorativo (alt vacío); el nombre accesible del enlace lo aporta el título.
			expect(screen.getByTestId('cover-image')).toHaveAttribute('alt', '');
			const link = screen.getByRole('link');
			expect(within(link).getByText(collectionTeaserMock.title)).toBeInTheDocument();
		});

		it('should use semantic article element', async () => {
			await render(CollectionTeaser, {
				inputs: { collection: collectionTeaserMock },
				providers: defaultProviders,
			});

			const article = screen.getByRole('article');
			expect(article).toBeInTheDocument();
		});
	});
});
