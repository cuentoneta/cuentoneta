import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';

import { HighlightedAuthorsComponent } from './highlighted-authors.component';
import { SectionHeaderComponent } from '@components/section-header/section-header.component';
import { EmptyStateComponent } from '@components/empty-state/empty-state.component';
import { AuthorTeaserCardComponent } from '@components/author-teaser-card/author-teaser-card.component';
import { AuthorTeaserCardSkeletonComponent } from '@components/author-teaser-card/author-teaser-card-skeleton.component';

import { onoffHighlightedAuthorsOfLength, onoffUntaggedHighlightedAuthor } from '@mocks/onoff-highlighted-authors.mock';

describe('HighlightedAuthorsComponent', () => {
	const defaultProviders = [provideRouter([])];
	// `componentImports` reemplaza los imports del componente bajo prueba, no los suma. Sin
	// `SectionHeaderComponent` el encabezado se renderiza como un elemento desconocido y la sección
	// pierde título, bajada y enlace.
	const defaultImports = [
		HighlightedAuthorsComponent,
		SectionHeaderComponent,
		EmptyStateComponent,
		AuthorTeaserCardComponent,
		AuthorTeaserCardSkeletonComponent,
	];

	describe('Renderizado del componente', () => {
		it('should display the section title', async () => {
			await render(HighlightedAuthorsComponent, {
				inputs: { authors: [] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.getByRole('heading', { name: 'Autores/as destacados/as', level: 2 })).toBeInTheDocument();
		});

		it('should describe the section as a curated selection', async () => {
			await render(HighlightedAuthorsComponent, {
				inputs: { authors: [] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.getByText('Una selección curada de autores y autoras imprescindibles')).toBeInTheDocument();
		});

		// El enlace se afirma con la lista vacía a propósito: es el caso en que el contenido curado todavía
		// no llegó, y es donde un enlace condicionado al dato desaparecería sin que nada más lo note.
		it('should link to the authors index even with nothing highlighted', async () => {
			await render(HighlightedAuthorsComponent, {
				inputs: { authors: [] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.getByRole('link', { name: 'Ver todo el índice de autores' })).toHaveAttribute('href', '/authors');
		});
	});

	describe('Estados del listado', () => {
		// Se afirma sobre el marcador de esqueleto, y con menos destacados que el tope: la tarjeta real y el
		// esqueleto son ambos `<article>`, así que contar artículos con la grilla llena se cumpliría igual
		// aunque ya hubiera cargado. La cantidad no sigue al input a propósito — la grilla en carga dibuja
		// la sección llena aunque todavía no haya llegado ningún destacado.
		it('should fill the grid with skeletons while loading, regardless of how many arrived', async () => {
			await render(HighlightedAuthorsComponent, {
				inputs: { authors: onoffHighlightedAuthorsOfLength(3), loading: true },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.getAllByTestId('skeleton')).toHaveLength(6);
		});

		it('should render one card per highlighted author when data is available', async () => {
			const highlighted = onoffHighlightedAuthorsOfLength(6);
			await render(HighlightedAuthorsComponent, {
				inputs: { authors: highlighted },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.getAllByRole('article')).toHaveLength(6);
			highlighted.forEach(({ author }) => {
				expect(screen.getByText(author.name)).toBeInTheDocument();
			});
		});

		// Cada entrada tiene su propia identidad, así que contar enlaces no alcanza: se afirma que cada uno
		// apunta al perfil que le corresponde y no seis veces al mismo.
		it('should link every card to its own author profile', async () => {
			const highlighted = onoffHighlightedAuthorsOfLength(3);
			await render(HighlightedAuthorsComponent, {
				inputs: { authors: highlighted },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			highlighted.forEach(({ author }) => {
				expect(screen.getByRole('link', { name: author.name })).toHaveAttribute('href', `/author/${author.slug}`);
			});
		});

		it('should carry the story count of each highlighted author', async () => {
			const [highlighted] = onoffHighlightedAuthorsOfLength(1);
			await render(HighlightedAuthorsComponent, {
				inputs: { authors: [highlighted] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.getByText(`${highlighted.storyCount} obras`)).toBeInTheDocument();
		});

		it('should transition from loading to complete state', async () => {
			const highlighted = onoffHighlightedAuthorsOfLength(6);
			const { rerender } = await render(HighlightedAuthorsComponent, {
				inputs: { authors: highlighted, loading: true },
				providers: defaultProviders,
				componentImports: defaultImports,
			});
			const [{ author }] = highlighted;

			expect(screen.getAllByTestId('skeleton')).toHaveLength(6);
			expect(screen.queryByRole('link', { name: author.name })).not.toBeInTheDocument();

			await rerender({ inputs: { authors: highlighted, loading: false } });

			expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
			expect(screen.getByRole('link', { name: author.name })).toBeInTheDocument();
		});

		// Sin destacados y sin carga la sección no queda en blanco debajo de su encabezado.
		it('should explain the emptiness when there is nothing to show', async () => {
			await render(HighlightedAuthorsComponent, {
				inputs: { authors: [] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.getByTestId('empty-state')).toBeInTheDocument();
			expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
		});
	});

	// Los tags de autor se derivan de los editoriales de las obras, y esa reconciliación todavía no corre:
	// la grilla sin etiquetas es el estado con el que la sección sale, no un borde.
	describe('Autor sin etiquetas', () => {
		it('should render the card without a tag list', async () => {
			await render(HighlightedAuthorsComponent, {
				inputs: { authors: [onoffUntaggedHighlightedAuthor] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.getByText(onoffUntaggedHighlightedAuthor.author.name)).toBeInTheDocument();
			expect(screen.queryByTestId('tags')).not.toBeInTheDocument();
		});
	});

	describe('Sin destacados', () => {
		// Omitir el input y pasarlo vacío llevan al mismo lugar: es el default del input, y el caso existe
		// para que ese default no se vuelva un estado distinto sin que nadie lo note.
		it.each([
			['omitiendo el input', undefined],
			['con la lista vacía', [] as const],
		])('should explain the emptiness %s', async (_caso, authors) => {
			await render(HighlightedAuthorsComponent, {
				...(authors ? { inputs: { authors } } : {}),
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.getByTestId('empty-state')).toBeInTheDocument();
			expect(screen.queryAllByRole('article')).toHaveLength(0);
			expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
		});
	});
});
