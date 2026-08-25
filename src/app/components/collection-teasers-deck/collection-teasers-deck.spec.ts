// Librería de pruebas
import { render, screen } from '@testing-library/angular';
import { DeferBlockState } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

// Componentes
import { CollectionTeasersDeck } from './collection-teasers-deck';
import { CollectionTeaserCard } from '@components/collection-teaser-card/collection-teaser-card';
import { CollectionTeaserCardSkeletonComponent } from '@components/collection-teaser-card/collection-teaser-card-skeleton';

// Mocks
import { onoffCollectionTeasersMock, onoffCollectionTeasersOfLength } from '@mocks/onoff-collections.mock';

describe('CollectionTeasersDeck', () => {
	const defaultProviders = [provideRouter([])];
	const defaultImports = [CollectionTeasersDeck, CollectionTeaserCard, CollectionTeaserCardSkeletonComponent];

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
	});

	describe('Comportamiento del bloque defer', () => {
		it('should render one skeleton per grid slot while loading', async () => {
			const { fixture } = await render(CollectionTeasersDeck, {
				inputs: { teasers: onoffCollectionTeasersOfLength(4) },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const [deferBlockFixture] = await fixture.getDeferBlocks();
			await deferBlockFixture.render(DeferBlockState.Loading);

			expect(screen.getAllByRole('article')).toHaveLength(4);
		});

		it('should render one card per teaser when data is available', async () => {
			const { fixture } = await render(CollectionTeasersDeck, {
				inputs: { teasers: onoffCollectionTeasersOfLength(3) },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const [deferBlockFixture] = await fixture.getDeferBlocks();
			await deferBlockFixture.render(DeferBlockState.Complete);

			expect(screen.getAllByRole('link')).toHaveLength(3);
			expect(screen.getByText('Colección 1')).toBeInTheDocument();
			expect(screen.getByText('Colección 3')).toBeInTheDocument();
		});

		it('should link each card to the collection page', async () => {
			const [teaser] = onoffCollectionTeasersOfLength(1);
			const { fixture } = await render(CollectionTeasersDeck, {
				inputs: { teasers: [teaser] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const [deferBlockFixture] = await fixture.getDeferBlocks();
			await deferBlockFixture.render(DeferBlockState.Complete);

			expect(screen.getByRole('link')).toHaveAttribute('href', `/collection/${teaser.slug}`);
		});

		it('should transition from loading to complete state', async () => {
			const { fixture } = await render(CollectionTeasersDeck, {
				inputs: { teasers: onoffCollectionTeasersOfLength(4) },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const [deferBlockFixture] = await fixture.getDeferBlocks();

			await deferBlockFixture.render(DeferBlockState.Loading);
			expect(screen.getAllByRole('article')).toHaveLength(4);

			await deferBlockFixture.render(DeferBlockState.Complete);
			expect(screen.getAllByRole('link')).toHaveLength(4);
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
