// Librería de pruebas
import { render, screen } from '@testing-library/angular';
import { DeferBlockState } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

// Componentes
import { CollectionTeasersDeck } from './collection-teasers-deck';
import { CollectionTeaser } from '@components/collection-teaser/collection-teaser';
import { CollectionTeaserSkeletonComponent } from '@components/collection-teaser/collection-teaser-skeleton';

// Mocks
import { storylistMock } from '@mocks/storylist.mock';

// Modelos
import { StorylistTeaser } from '@models/storylist.model';

// Función auxiliar para generar múltiples teasers a partir del mock existente
function generateTeaserMocks(count: number): StorylistTeaser[] {
	return Array.from({ length: count }, (_, index) => ({
		...storylistMock,
		_id: `storylist-mock-${index + 1}`,
		title: `Colección ${index + 1}`,
		slug: `coleccion-${index + 1}`,
		stories: [],
		tabs: [],
	})) as StorylistTeaser[];
}

describe('CollectionTeasersDeck', () => {
	// Providers necesarios para las pruebas
	const defaultProviders = [provideRouter([])];

	// Imports por defecto incluyendo los componentes reales
	const defaultImports = [CollectionTeasersDeck, CollectionTeaser, CollectionTeaserSkeletonComponent];

	// Pruebas de renderizado básico
	describe('Renderizado del componente', () => {
		it('should render the component', async () => {
			const { container } = await render(CollectionTeasersDeck, {
				inputs: { teasers: [] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});
			expect(container).toBeTruthy();
		});

		it('should display the section title', async () => {
			await render(CollectionTeasersDeck, {
				inputs: { teasers: [] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});
			const title = screen.getByRole('heading', { name: 'Colecciones' });
			expect(title).toBeInTheDocument();
		});

		it('should display the section description', async () => {
			await render(CollectionTeasersDeck, {
				inputs: { teasers: [] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});
			const description = screen.getByText('Historias agrupadas por temas, estilos y universos en común');
			expect(description).toBeInTheDocument();
		});
	});

	// Pruebas del bloque defer
	describe('Comportamiento del bloque defer', () => {
		it('should render skeletons in loading state', async () => {
			const { fixture } = await render(CollectionTeasersDeck, {
				inputs: { teasers: generateTeaserMocks(4) },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const deferBlockFixture = (await fixture.getDeferBlocks())[0];
			await deferBlockFixture.render(DeferBlockState.Loading);

			// Verificar que se renderizan 6 skeletons buscando por los artículos internos
			const skeletonArticles = screen.getAllByRole('article');
			expect(skeletonArticles.length).toBe(4);
		});

		it('should render collection teasers when data is available', async () => {
			const teasers = generateTeaserMocks(3);
			const { fixture } = await render(CollectionTeasersDeck, {
				inputs: { teasers },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const deferBlockFixture = (await fixture.getDeferBlocks())[0];
			await deferBlockFixture.render(DeferBlockState.Complete);

			// Verificar que se renderizan las tarjetas por sus links
			const links = screen.getAllByRole('link');
			expect(links.length).toBe(3);
		});

		it('should transition from loading to complete state', async () => {
			const teasers = generateTeaserMocks(4);
			const { fixture } = await render(CollectionTeasersDeck, {
				inputs: { teasers },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const deferBlockFixture = (await fixture.getDeferBlocks())[0];

			// Primero verificar el estado de carga
			await deferBlockFixture.render(DeferBlockState.Loading);
			const articles = screen.getAllByRole('article');
			expect(articles.length).toBe(4);

			// Luego verificar el estado completo
			await deferBlockFixture.render(DeferBlockState.Complete);
			const links = screen.getAllByRole('link');
			expect(links.length).toBe(4);
		});

		it('should display the correct titles in collection teasers', async () => {
			const teasers = generateTeaserMocks(3);
			const { fixture } = await render(CollectionTeasersDeck, {
				inputs: { teasers },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const deferBlockFixture = (await fixture.getDeferBlocks())[0];
			await deferBlockFixture.render(DeferBlockState.Complete);

			// Verificar que los títulos se muestran correctamente
			expect(screen.getByText('Colección 1')).toBeInTheDocument();
			expect(screen.getByText('Colección 2')).toBeInTheDocument();
			expect(screen.getByText('Colección 3')).toBeInTheDocument();
		});
	});

	// Pruebas de inputs
	describe('Inputs del componente', () => {
		it('should accept an empty array of teasers', async () => {
			const { fixture } = await render(CollectionTeasersDeck, {
				inputs: { teasers: [] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(fixture.componentInstance.teasers()).toEqual([]);
		});

		it('should receive the correct number of teasers', async () => {
			const teasers = generateTeaserMocks(5);
			const { fixture } = await render(CollectionTeasersDeck, {
				inputs: { teasers },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(fixture.componentInstance.teasers()).toHaveLength(5);
		});

		it('should have default empty array when no teasers provided', async () => {
			const { fixture } = await render(CollectionTeasersDeck, {
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(fixture.componentInstance.teasers()).toEqual([]);
		});
	});

	// Pruebas de accesibilidad
	describe('Accesibilidad', () => {
		it('should have a heading element for the section title', async () => {
			await render(CollectionTeasersDeck, {
				inputs: { teasers: [] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const heading = screen.getByRole('heading', { level: 2 });
			expect(heading).toBeInTheDocument();
			expect(heading).toHaveTextContent('Colecciones');
		});

		it('should display description text', async () => {
			await render(CollectionTeasersDeck, {
				inputs: { teasers: [] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const description = screen.getByText('Historias agrupadas por temas, estilos y universos en común');
			expect(description).toBeInTheDocument();
		});

		it('should render links for each teaser in complete state', async () => {
			const teasers = generateTeaserMocks(2);
			const { fixture } = await render(CollectionTeasersDeck, {
				inputs: { teasers },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const deferBlockFixture = (await fixture.getDeferBlocks())[0];
			await deferBlockFixture.render(DeferBlockState.Complete);

			// Verificar que existen los links de navegación
			const links = screen.getAllByRole('link');
			expect(links.length).toBe(2);
		});
	});
});
