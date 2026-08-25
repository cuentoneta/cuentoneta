import { render, screen } from '@testing-library/angular';
import { DeferBlockState } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';

import { HighlightedAuthorsComponent } from './highlighted-authors.component';
import { ButtonComponent } from '@components/button/button.component';
import { AuthorCardTeaserComponent } from '@components/author-card-teaser/author-card-teaser.component';
import { AuthorCardTeaserSkeletonComponent } from '@components/author-card-teaser/author-card-teaser-skeleton.component';

import { onoffHighlightedAuthorsOfLength, onoffUntaggedHighlightedAuthor } from '@mocks/onoff-highlighted-authors.mock';

describe('HighlightedAuthorsComponent', () => {
	const defaultProviders = [provideRouter([])];
	// `componentImports` reemplaza los imports del componente bajo prueba, no los suma. Sin `RouterLink` el
	// enlace del encabezado se renderiza como un `<a>` sin `href` y deja de tener rol de link; el botón va
	// por consistencia con lo que el componente declara, aunque solo aporte clases.
	const defaultImports = [
		HighlightedAuthorsComponent,
		RouterLink,
		ButtonComponent,
		AuthorCardTeaserComponent,
		AuthorCardTeaserSkeletonComponent,
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

			expect(screen.getByRole('link', { name: 'Ver todos los autores' })).toHaveAttribute('href', '/authors');
		});
	});

	describe('Comportamiento del bloque defer', () => {
		// Se afirma sobre el marcador de esqueleto y con una cantidad distinta de seis: la tarjeta real y el
		// esqueleto son ambos `<article>`, así que contar artículos con la grilla llena se cumpliría igual
		// aunque la rama de carga dibujara una cantidad fija o el bloque hubiera resuelto.
		it('should render exactly one skeleton per highlighted author while loading', async () => {
			const { fixture } = await render(HighlightedAuthorsComponent, {
				inputs: { authors: onoffHighlightedAuthorsOfLength(3) },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const [deferBlockFixture] = await fixture.getDeferBlocks();
			await deferBlockFixture.render(DeferBlockState.Loading);

			expect(screen.getAllByTestId('skeleton')).toHaveLength(3);
		});

		it('should render one card per highlighted author when data is available', async () => {
			const highlighted = onoffHighlightedAuthorsOfLength(6);
			const { fixture } = await render(HighlightedAuthorsComponent, {
				inputs: { authors: highlighted },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const [deferBlockFixture] = await fixture.getDeferBlocks();
			await deferBlockFixture.render(DeferBlockState.Complete);

			expect(screen.getAllByRole('article')).toHaveLength(6);
			highlighted.forEach(({ author }) => {
				expect(screen.getByText(author.name)).toBeInTheDocument();
			});
		});

		// Cada entrada tiene su propia identidad, así que contar enlaces no alcanza: se afirma que cada uno
		// apunta al perfil que le corresponde y no seis veces al mismo.
		it('should link every card to its own author profile', async () => {
			const highlighted = onoffHighlightedAuthorsOfLength(3);
			const { fixture } = await render(HighlightedAuthorsComponent, {
				inputs: { authors: highlighted },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const [deferBlockFixture] = await fixture.getDeferBlocks();
			await deferBlockFixture.render(DeferBlockState.Complete);

			highlighted.forEach(({ author }) => {
				expect(screen.getByRole('link', { name: author.name })).toHaveAttribute('href', `/author/${author.slug}`);
			});
		});

		it('should carry the story count of each highlighted author', async () => {
			const [highlighted] = onoffHighlightedAuthorsOfLength(1);
			const { fixture } = await render(HighlightedAuthorsComponent, {
				inputs: { authors: [highlighted] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const [deferBlockFixture] = await fixture.getDeferBlocks();
			await deferBlockFixture.render(DeferBlockState.Complete);

			expect(screen.getByText(`${highlighted.storyCount} historias`)).toBeInTheDocument();
		});

		it('should transition from loading to complete state', async () => {
			const highlighted = onoffHighlightedAuthorsOfLength(6);
			const { fixture } = await render(HighlightedAuthorsComponent, {
				inputs: { authors: highlighted },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const [deferBlockFixture] = await fixture.getDeferBlocks();
			const [{ author }] = highlighted;

			await deferBlockFixture.render(DeferBlockState.Loading);
			expect(screen.getAllByTestId('skeleton')).toHaveLength(6);
			expect(screen.queryByRole('link', { name: author.name })).not.toBeInTheDocument();

			await deferBlockFixture.render(DeferBlockState.Complete);
			expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
			expect(screen.getByRole('link', { name: author.name })).toBeInTheDocument();
		});
	});

	// Los tags de autor se derivan de los editoriales de las obras, y esa reconciliación todavía no corre:
	// la grilla sin etiquetas es el estado con el que la sección sale, no un borde.
	describe('Autor sin etiquetas', () => {
		it('should render the card without a tag list', async () => {
			const { fixture } = await render(HighlightedAuthorsComponent, {
				inputs: { authors: [onoffUntaggedHighlightedAuthor] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			const [deferBlockFixture] = await fixture.getDeferBlocks();
			await deferBlockFixture.render(DeferBlockState.Complete);

			expect(screen.getByText(onoffUntaggedHighlightedAuthor.author.name)).toBeInTheDocument();
			expect(screen.queryByTestId('tags')).not.toBeInTheDocument();
		});
	});

	describe('Sin destacados', () => {
		it('should render neither cards nor skeletons when the input is omitted', async () => {
			await render(HighlightedAuthorsComponent, {
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.queryAllByRole('article')).toHaveLength(0);
			expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
		});

		it('should render neither cards nor skeletons when the week has nothing highlighted', async () => {
			await render(HighlightedAuthorsComponent, {
				inputs: { authors: [] },
				providers: defaultProviders,
				componentImports: defaultImports,
			});

			expect(screen.queryAllByRole('article')).toHaveLength(0);
			expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
		});
	});
});
