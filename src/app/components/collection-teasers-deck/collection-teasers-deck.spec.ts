// Librería de pruebas
import { render, screen } from '@testing-library/angular';
import { DeferBlockState } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

// Componentes
import { CollectionTeasersDeck } from './collection-teasers-deck';
import { CollectionTeaser } from '@components/collection-teaser/collection-teaser.component';
import { CollectionTeaserSkeleton } from '@components/collection-teaser/collection-teaser-skeleton';

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
	const defaultImports = [CollectionTeasersDeck, CollectionTeaser, CollectionTeaserSkeleton];

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
				inputs: { teasers: generateTeaserMocks(6) },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const deferBlockFixture = (await fixture.getDeferBlocks())[0];
			await deferBlockFixture.render(DeferBlockState.Loading);

			// Verificar que se renderizan 6 skeletons
			const skeletons = fixture.nativeElement.querySelectorAll('cuentoneta-collection-teaser-skeleton');
			expect(skeletons.length).toBe(6);
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

			// Verificar que se renderizan las tarjetas
			const cards = fixture.nativeElement.querySelectorAll('cuentoneta-collection-teaser');
			expect(cards.length).toBe(3);
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
			let skeletons = fixture.nativeElement.querySelectorAll('cuentoneta-collection-teaser-skeleton');
			expect(skeletons.length).toBe(6);

			// Luego verificar el estado completo
			await deferBlockFixture.render(DeferBlockState.Complete);
			const cards = fixture.nativeElement.querySelectorAll('cuentoneta-collection-teaser');
			expect(cards.length).toBe(4);

			// Los skeletons no deben estar presentes
			skeletons = fixture.nativeElement.querySelectorAll('cuentoneta-collection-teaser-skeleton');
			expect(skeletons.length).toBe(0);
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

	// Pruebas del grid de tarjetas
	describe('Grid de tarjetas', () => {
		it('should apply correct grid classes to the section', async () => {
			const teasers = generateTeaserMocks(2);
			const { fixture } = await render(CollectionTeasersDeck, {
				inputs: { teasers },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const deferBlockFixture = (await fixture.getDeferBlocks())[0];
			await deferBlockFixture.render(DeferBlockState.Complete);

			const section = fixture.nativeElement.querySelector('section');
			expect(section).toHaveClass('grid');
			expect(section).toHaveClass('grid-cols-1');
			expect(section).toHaveClass('sm:grid-cols-2');
			expect(section).toHaveClass('gap-8');
		});

		it('should apply card class to each collection teaser element', async () => {
			const teasers = generateTeaserMocks(2);
			const { fixture } = await render(CollectionTeasersDeck, {
				inputs: { teasers },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const deferBlockFixture = (await fixture.getDeferBlocks())[0];
			await deferBlockFixture.render(DeferBlockState.Complete);

			const cards = fixture.nativeElement.querySelectorAll('cuentoneta-collection-teaser');
			cards.forEach((card: HTMLElement) => {
				expect(card).toHaveClass('w-full');
				expect(card).toHaveClass('card');
			});
		});

		it('should apply card class to each skeleton element', async () => {
			const teasers = generateTeaserMocks(6);
			const { fixture } = await render(CollectionTeasersDeck, {
				inputs: { teasers },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const deferBlockFixture = (await fixture.getDeferBlocks())[0];
			await deferBlockFixture.render(DeferBlockState.Loading);

			const skeletons = fixture.nativeElement.querySelectorAll('cuentoneta-collection-teaser-skeleton');
			skeletons.forEach((skeleton: HTMLElement) => {
				expect(skeleton).toHaveClass('w-full');
				expect(skeleton).toHaveClass('card');
			});
		});
	});

	// Pruebas de estructura del componente
	describe('Estructura del componente', () => {
		it('should have main layout elements rendered', async () => {
			const { fixture } = await render(CollectionTeasersDeck, {
				inputs: { teasers: [] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			// Verificar que el componente tiene la estructura principal
			const headerDiv = fixture.nativeElement.querySelector('.flex.items-center.justify-between');
			const section = fixture.nativeElement.querySelector('section');

			expect(headerDiv).toBeInTheDocument();
			expect(section).toBeInTheDocument();
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

		it('should have proper semantic structure with section element', async () => {
			const teasers = generateTeaserMocks(2);
			const { fixture } = await render(CollectionTeasersDeck, {
				inputs: { teasers },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const deferBlockFixture = (await fixture.getDeferBlocks())[0];
			await deferBlockFixture.render(DeferBlockState.Complete);

			// Verificar que existe la sección de tarjetas
			const section = fixture.nativeElement.querySelector('section');
			expect(section).toBeInTheDocument();
		});

		it('should have header content structure with title and description', async () => {
			const { fixture } = await render(CollectionTeasersDeck, {
				inputs: { teasers: [] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			// Verificar estructura del encabezado
			const headerContainer = fixture.nativeElement.querySelector('.flex.items-center.justify-between');
			expect(headerContainer).toBeInTheDocument();

			const titleElement = headerContainer.querySelector('h2');
			expect(titleElement).toHaveTextContent('Colecciones');

			const descriptionElement = headerContainer.querySelector('.text-neutral-600');
			expect(descriptionElement).toBeInTheDocument();
		});
	});
});
