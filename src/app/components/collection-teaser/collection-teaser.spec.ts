// Librería de pruebas
import { render, screen, within } from '@testing-library/angular';
import { provideRouter } from '@angular/router';

// Componentes
import { CollectionTeaser } from './collection-teaser';

// Mocks
import { storylistMock } from '@mocks/storylist.mock';

// Modelos
import { StorylistTeaser } from '@models/storylist.model';

// Mock de StorylistTeaser basado en el mock existente
const collectionTeaserMock: StorylistTeaser = {
	...storylistMock,
	stories: [],
	tabs: [],
} as StorylistTeaser;

describe('CollectionTeaser', () => {
	// Providers necesarios para las pruebas
	const defaultProviders = [provideRouter([])];

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

	// Pruebas de la imagen (cover delegado a CoverImageComponent)
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

		it('should have correct dimensions', async () => {
			await render(CollectionTeaser, {
				inputs: { collection: collectionTeaserMock },
				providers: defaultProviders,
			});

			const image = screen.getByTestId('cover-image');
			expect(image).toHaveAttribute('height', '164');
			expect(image).toHaveAttribute('width', '118');
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
