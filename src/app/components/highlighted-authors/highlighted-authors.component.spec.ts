import { DeferBlockState } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';

import { HighlightedAuthorsComponent } from './highlighted-authors.component';
import { HighlightedAuthorsSkeletonComponent } from './highlighted-authors-skeleton.component';
import { AuthorTeaserV3Component } from '@components/author-teaser-v3/author-teaser-v3.component';
import { AuthorTeaserV3SkeletonComponent } from '@components/author-teaser-v3/author-teaser-v3-skeleton.component';
import { highlightedAuthorsMock } from '@mocks/highlighted-authors.mock';

describe('HighlightedAuthorsComponent', () => {
	const defaultProviders = [provideRouter([])];
	const defaultImports = [
		HighlightedAuthorsComponent,
		HighlightedAuthorsSkeletonComponent,
		AuthorTeaserV3Component,
		AuthorTeaserV3SkeletonComponent,
	];

	describe('Renderizado del componente', () => {
		it('should display the section title', async () => {
			await render(HighlightedAuthorsComponent, {
				inputs: { authors: [] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});
			expect(screen.getByRole('heading', { name: 'Autores/as destacados/as' })).toBeInTheDocument();
		});

		it('should display the section subtitle', async () => {
			await render(HighlightedAuthorsComponent, {
				inputs: { authors: [] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});
			expect(screen.getByText('Una selección curada de autores y autoras imprescindibles')).toBeInTheDocument();
		});

		it('should not render the Ver todo link while the authors page is not ready', async () => {
			await render(HighlightedAuthorsComponent, {
				inputs: { authors: highlightedAuthorsMock },
				providers: defaultProviders,
				componentImports: defaultImports,
			});
			expect(screen.queryByRole('link', { name: 'Ver todo' })).not.toBeInTheDocument();
		});
	});

	describe('Comportamiento del bloque defer', () => {
		it('should render skeletons in loading state', async () => {
			const { fixture } = await render(HighlightedAuthorsComponent, {
				inputs: { authors: highlightedAuthorsMock },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const deferBlockFixture = (await fixture.getDeferBlocks())[0];
			await deferBlockFixture.render(DeferBlockState.Loading);

			expect(screen.getAllByTestId('skeleton')).toHaveLength(6);
		});

		it('should render up to six author teasers when data is available', async () => {
			const { fixture } = await render(HighlightedAuthorsComponent, {
				inputs: { authors: highlightedAuthorsMock },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const deferBlockFixture = (await fixture.getDeferBlocks())[0];
			await deferBlockFixture.render(DeferBlockState.Complete);

			expect(screen.getAllByTestId('author-teaser')).toHaveLength(6);
			expect(screen.getByText('Clarice Lispector')).toBeInTheDocument();
			expect(screen.getByText('Héctor Germán Oesterheld')).toBeInTheDocument();
		});

		it('should pass tags and story count to each teaser', async () => {
			const { fixture } = await render(HighlightedAuthorsComponent, {
				inputs: { authors: highlightedAuthorsMock.slice(0, 1) },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const deferBlockFixture = (await fixture.getDeferBlocks())[0];
			await deferBlockFixture.render(DeferBlockState.Complete);

			expect(screen.getByText('Surrealismo')).toBeInTheDocument();
			expect(screen.getByTestId('story-count')).toHaveTextContent('27 historias');
		});
	});

	describe('Inputs del componente', () => {
		it('should accept an empty array of authors', async () => {
			const { fixture } = await render(HighlightedAuthorsComponent, {
				inputs: { authors: [] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(fixture.componentInstance.authors()).toEqual([]);
			expect(screen.queryByTestId('author-teaser')).not.toBeInTheDocument();
		});

		it('should have default empty array when no authors provided', async () => {
			const { fixture } = await render(HighlightedAuthorsComponent, {
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(fixture.componentInstance.authors()).toEqual([]);
		});
	});
});
