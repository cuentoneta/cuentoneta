// Librería de pruebas
import { render, screen, within } from '@testing-library/angular';
import { provideRouter } from '@angular/router';

// Página
import CollectionPage from './collection.page';

// Providers
import { provideCollectionApiMock, InMemoryCollectionApi } from '../../providers/collection.mock';

// Modelos
import { createCollection, type Collection } from '@models/collection.model';

// Mocks
import {
	onoffCollectionsHidingAuthorsMock,
	onoffCollectionsMock,
	onoffCollectionsShowingAuthorsMock,
	onoffCollectionsWithDivergentLiteraryWorkTagsMock,
	onoffCollectionsWithTagsMock,
} from '@mocks/onoff-collections.mock';

// Utilidades de test
import { clearAllMocks } from '@test-utils';

const [showingAuthors] = onoffCollectionsShowingAuthorsMock;
const [hidingAuthors] = onoffCollectionsHidingAuthorsMock;
const [divergentTags] = onoffCollectionsWithDivergentLiteraryWorkTagsMock;
const [tagged] = onoffCollectionsWithTagsMock;

// Ninguna obra del canon carece de etiquetas, así que se deriva una sobre una colección que sí las
// tiene. El slug propio evita que conviva con su homónima en el catálogo del doble.
const [firstTaggedWork, ...restTaggedWorks] = tagged.literaryWorks;
const collectionWithUntaggedLiteraryWork = createCollection({
	...tagged,
	slug: `${tagged.slug}-obra-sin-etiquetas`,
	literaryWorks: [{ ...firstTaggedWork, tags: [] }, ...restTaggedWorks],
});

const literaryWorkCards = () => within(screen.getByTestId('literary-works')).getAllByRole('article');

const renderPage = (slug: string, collections: readonly Collection[] = onoffCollectionsMock) =>
	render(CollectionPage, {
		inputs: { slug },
		providers: [provideRouter([]), provideCollectionApiMock(new InMemoryCollectionApi(collections))],
	});

describe('CollectionPage', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	describe('contenido', () => {
		it('should render the title of the collection as its heading', async () => {
			await renderPage(showingAuthors.slug);

			expect(screen.getByRole('heading', { level: 1, name: showingAuthors.title })).toBeInTheDocument();
		});

		it('should render one card per literary work of the collection', async () => {
			await renderPage(showingAuthors.slug);

			showingAuthors.literaryWorks.forEach((literaryWork) =>
				expect(screen.getByText(literaryWork.title)).toBeInTheDocument(),
			);
		});

		// Sin los query params, la página de lectura no sabe desde dónde se llegó y cae a sugerir por
		// autor: el contexto de colección sólo existe si la tarjeta lo emite.
		it('should link each work carrying the collection as navigation context', async () => {
			await renderPage(showingAuthors.slug);

			const [firstWork] = showingAuthors.literaryWorks;
			const link = screen.getByRole('link', { name: firstWork.title });

			expect(link.getAttribute('href')).toBe(
				`/literary-work/${firstWork.slug}?navigation=collection&navigationSlug=${showingAuthors.slug}`,
			);
		});

		it('should render the information panel of the collection', async () => {
			await renderPage(showingAuthors.slug);

			const panel = screen.getByTestId('collection-info');
			expect(within(panel).getByTestId('description')).toBeInTheDocument();
		});
	});

	// Las aserciones se acotan a cada tarjeta porque la etiqueta de la colección también se pinta en el
	// panel lateral.
	describe('etiqueta de cada obra', () => {
		it('should label each work with its own first tag', async () => {
			await renderPage(divergentTags.slug);

			const cards = literaryWorkCards();
			const [collectionTag] = divergentTags.tags;
			expect(cards).toHaveLength(divergentTags.literaryWorks.length);
			// Una obra sin etiquetas tiene su propio caso abajo: acá solo se comparan las que llevan una.
			const labelledCards = divergentTags.literaryWorks.flatMap((literaryWork, index) =>
				literaryWork.tags.slice(0, 1).map((ownTag) => ({ card: cards[index], ownTag })),
			);
			labelledCards.forEach(({ card, ownTag }) => {
				expect(within(card).getByText(ownTag.title)).toBeInTheDocument();
				if (ownTag.title !== collectionTag.title) {
					expect(within(card).queryByText(collectionTag.title)).not.toBeInTheDocument();
				}
			});
		});

		it('should not label a work without tags even when the collection has some', async () => {
			await renderPage(collectionWithUntaggedLiteraryWork.slug, [
				...onoffCollectionsMock,
				collectionWithUntaggedLiteraryWork,
			]);

			// El heading confirma que se renderizó la colección derivada y no el estado de no encontrada.
			expect(
				screen.getByRole('heading', { level: 1, name: collectionWithUntaggedLiteraryWork.title }),
			).toBeInTheDocument();
			const [untaggedCard] = literaryWorkCards();
			expect(
				within(untaggedCard).queryByText(collectionWithUntaggedLiteraryWork.tags[0].title),
			).not.toBeInTheDocument();
			expect(within(untaggedCard).getByTestId('reading-time')).toBeInTheDocument();
		});
	});

	describe('colecciones sugeridas', () => {
		it('should offer other collections of the catalogue', async () => {
			await renderPage(showingAuthors.slug);

			expect(screen.getAllByTestId('suggested-collection').length).toBeGreaterThan(0);
		});

		// Ofrecer la colección que se está leyendo sería un enlace a la misma página.
		it('should not offer the collection being read', async () => {
			await renderPage(showingAuthors.slug);

			const suggested = screen.getAllByTestId('suggested-collection');
			suggested.forEach((teaser) => expect(teaser).not.toHaveTextContent(showingAuthors.title));
		});
	});

	describe('estado de no encontrada', () => {
		it('should tell the reader when the collection does not exist', async () => {
			await renderPage('inexistente');

			expect(screen.getByRole('heading', { level: 1, name: /No encontramos esta colección/ })).toBeInTheDocument();
		});

		it('should not render the information panel', async () => {
			await renderPage('inexistente');

			expect(screen.queryByTestId('description')).not.toBeInTheDocument();
		});
	});

	describe('recorte del extracto', () => {
		// Con el autor visible el extracto dispone de una línea menos: la regla la fija la colección,
		// no la tarjeta.
		it('should clamp to three lines when the collection shows authors', async () => {
			await renderPage(showingAuthors.slug);

			expect(within(screen.getByTestId('literary-works')).getAllByTestId('description')[0]).toHaveClass('line-clamp-3');
		});

		it('should clamp to four lines when the collection hides authors', async () => {
			await renderPage(hidingAuthors.slug);

			expect(within(screen.getByTestId('literary-works')).getAllByTestId('description')[0]).toHaveClass('line-clamp-4');
		});
	});

	// Las directivas tienen su propio spec: lo que se ejercita acá es el cableado, que ninguno de los
	// dos ve — que la página las declare y les provea la colección que resolvió.
	describe('indexado', () => {
		afterEach(() => {
			// eslint-disable-next-line testing-library/no-node-access -- el <head> no tiene rol accesible: se consulta por selector
			document.head.querySelectorAll('script[data-schema-id]').forEach((el) => el.remove());
		});

		// La canónica sale de la colección resuelta, así que verla apuntar al slug correcto prueba que la
		// directiva la recibió. El `robots` no sirve para esto: en un build no indexable —el de los tests—
		// se fuerza a `noindex` sin mirar lo que la página pidió, y eso lo cubre el spec de la directiva.
		it('should point the canonical URL at the collection', async () => {
			await renderPage(showingAuthors.slug);

			// eslint-disable-next-line testing-library/no-node-access -- el <head> no tiene rol accesible: se consulta por selector
			expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toContain(
				`/collection/${showingAuthors.slug}`,
			);
		});

		it('should emit both JSON-LD blocks', async () => {
			await renderPage(showingAuthors.slug);

			/* eslint-disable testing-library/no-node-access -- el <head> no tiene rol accesible: se consulta por selector */
			expect(document.head.querySelector('script[data-schema-id="collection"]')).not.toBeNull();
			expect(document.head.querySelector('script[data-schema-id="breadcrumb-collection"]')).not.toBeNull();
			/* eslint-enable testing-library/no-node-access */
		});
	});
});
