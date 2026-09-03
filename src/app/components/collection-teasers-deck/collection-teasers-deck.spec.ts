// Librería de pruebas
import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';

// Componentes
import { CollectionTeasersDeck } from './collection-teasers-deck';
import { SectionHeaderComponent } from '@components/section-header/section-header.component';
import { EmptyStateComponent } from '@components/empty-state/empty-state.component';
import { CollectionTeaserCard } from '@components/collection-teaser-card/collection-teaser-card';
import { CollectionTeaserCardSkeletonComponent } from '@components/collection-teaser-card/collection-teaser-card-skeleton';

// Mocks
import { onoffCollectionTeasersMock, onoffCollectionTeasersOfLength } from '@mocks/onoff-collections.mock';

describe('CollectionTeasersDeck', () => {
	const defaultProviders = [provideRouter([])];
	// `componentImports` reemplaza los imports del componente bajo prueba, no los suma. Sin
	// `SectionHeaderComponent` el encabezado se renderiza como un elemento desconocido y la sección
	// pierde título, bajada y enlace.
	const defaultImports = [
		CollectionTeasersDeck,
		SectionHeaderComponent,
		EmptyStateComponent,
		CollectionTeaserCard,
		CollectionTeaserCardSkeletonComponent,
	];
	// Se seleccionan por su destino —una colección concreta, no el índice—, no por descarte del enlace
	// del encabezado: un segundo enlace que no sea tarjeta no debe contarse como una.
	const cardLinks = () =>
		screen.getAllByRole('link').filter((link) => link.getAttribute('href')?.startsWith('/collection/'));

	describe('Renderizado del componente', () => {
		it('should display the section title', async () => {
			await render(CollectionTeasersDeck, {
				inputs: { teasers: [] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.getByRole('heading', { name: 'Colecciones', level: 2 })).toBeInTheDocument();
		});

		it('should describe the section in terms of literary works', async () => {
			await render(CollectionTeasersDeck, {
				inputs: { teasers: [] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.getByText('Obras agrupadas por temas, estilos y universos en común')).toBeInTheDocument();
		});

		// Con la lista vacía a propósito, igual que en autores destacados: es donde un enlace condicionado
		// al dato desaparecería sin que nada más lo note.
		it('should link to the collections index even with nothing to show', async () => {
			await render(CollectionTeasersDeck, {
				inputs: { teasers: [] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.getByRole('link', { name: 'Ver todo el índice de colecciones' })).toHaveAttribute(
				'href',
				'/collection',
			);
		});
	});

	describe('Estados del listado', () => {
		it('should fill the grid with skeletons while loading', async () => {
			await render(CollectionTeasersDeck, {
				inputs: { teasers: onoffCollectionTeasersOfLength(4), loading: true },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.getAllByTestId('skeleton')).toHaveLength(4);
			expect(cardLinks()).toHaveLength(0);
		});

		it('should render one card per teaser when data is available', async () => {
			await render(CollectionTeasersDeck, {
				inputs: { teasers: onoffCollectionTeasersOfLength(3) },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(cardLinks()).toHaveLength(3);
			expect(screen.getByText('Colección 1')).toBeInTheDocument();
			expect(screen.getByText('Colección 3')).toBeInTheDocument();
			expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
		});

		it('should link each card to the collection page', async () => {
			const [teaser] = onoffCollectionTeasersOfLength(1);
			await render(CollectionTeasersDeck, {
				inputs: { teasers: [teaser] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(cardLinks()[0]).toHaveAttribute('href', `/collection/${teaser.slug}`);
		});

		// Sin colecciones y sin carga la sección no queda en blanco debajo de su encabezado.
		it('should explain the emptiness when there is nothing to show', async () => {
			await render(CollectionTeasersDeck, {
				inputs: { teasers: [] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.getByTestId('empty-state')).toBeInTheDocument();
			expect(cardLinks()).toHaveLength(0);
			expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
		});
	});

	describe('Inputs del componente', () => {
		it('should have default empty array when no teasers provided', async () => {
			const { fixture } = await render(CollectionTeasersDeck, {
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(fixture.componentInstance.teasers()).toEqual([]);
		});

		it('should accept the collections of the corpus', async () => {
			const { fixture } = await render(CollectionTeasersDeck, {
				inputs: { teasers: onoffCollectionTeasersMock },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(fixture.componentInstance.teasers()).toHaveLength(onoffCollectionTeasersMock.length);
		});
	});
});
