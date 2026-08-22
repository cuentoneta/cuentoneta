// Librería de pruebas
import { render, screen, within } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { of, throwError } from 'rxjs';

// Página
import CollectionPage from './collection.page';

// Providers
import type { CollectionApi } from '../../providers/collection.provider';
import { provideCollectionApiMock, StubCollectionApi } from '../../providers/collection.mock';

// Modelos
import type { Collection, CollectionTeaser } from '@models/collection.model';

// Mocks
import {
	onoffCollectionsHidingAuthorsMock,
	onoffCollectionsMock,
	onoffCollectionsShowingAuthorsMock,
} from '@mocks/onoff-collections.mock';

// Utilidades de test
import { clearAllMocks } from '@test-utils';

const [showingAuthors] = onoffCollectionsShowingAuthorsMock;
const [hidingAuthors] = onoffCollectionsHidingAuthorsMock;

// El doble del provider nunca falla —cae a la primera colección—, así que los casos de error necesitan
// uno que lance: sin esto, el estado de no encontrada daría verde sin ejercitarse.
class FailingCollectionApi implements CollectionApi {
	constructor(private readonly error: unknown) {}

	public getBySlug(): Observable<Collection> {
		return throwError(() => this.error);
	}

	public getAll(): Observable<CollectionTeaser[]> {
		return of([]);
	}
}

const renderPage = (collection: Collection) =>
	render(CollectionPage, {
		inputs: { slug: collection.slug },
		providers: [provideRouter([]), provideCollectionApiMock(new StubCollectionApi(onoffCollectionsMock))],
	});

const renderFailingPage = (error: unknown) =>
	render(CollectionPage, {
		inputs: { slug: 'inexistente' },
		providers: [provideRouter([]), provideCollectionApiMock(new FailingCollectionApi(error))],
	});

describe('CollectionPage', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	describe('contenido', () => {
		it('should render the title of the collection as its heading', async () => {
			await renderPage(showingAuthors);

			expect(screen.getByRole('heading', { level: 1, name: showingAuthors.title })).toBeInTheDocument();
		});

		it('should render one card per literary work of the collection', async () => {
			await renderPage(showingAuthors);

			showingAuthors.literaryWorks.forEach((literaryWork) =>
				expect(screen.getByText(literaryWork.title)).toBeInTheDocument(),
			);
		});

		it('should render the information panel of the collection', async () => {
			await renderPage(showingAuthors);

			const panel = screen.getByTestId('collection-info');
			expect(within(panel).getByTestId('description')).toBeInTheDocument();
		});
	});

	describe('colecciones sugeridas', () => {
		it('should offer other collections of the catalogue', async () => {
			await renderPage(showingAuthors);

			expect(screen.getAllByTestId('suggested-collection').length).toBeGreaterThan(0);
		});

		// Ofrecer la colección que se está leyendo sería un enlace a la misma página.
		it('should not offer the collection being read', async () => {
			await renderPage(showingAuthors);

			const suggested = screen.getAllByTestId('suggested-collection');
			suggested.forEach((teaser) => expect(teaser).not.toHaveTextContent(showingAuthors.title));
		});
	});

	describe('estado de no encontrada', () => {
		it('should tell the reader when the collection does not exist', async () => {
			await renderFailingPage(new HttpErrorResponse({ status: 404 }));

			expect(screen.getByRole('heading', { level: 1, name: /No encontramos esta colección/ })).toBeInTheDocument();
		});

		it('should not render the information panel', async () => {
			await renderFailingPage(new HttpErrorResponse({ status: 404 }));

			expect(screen.queryByTestId('description')).not.toBeInTheDocument();
		});
	});

	describe('recorte del extracto', () => {
		// Con el autor visible el extracto dispone de una línea menos: la regla la fija la colección,
		// no la tarjeta.
		it('should clamp to three lines when the collection shows authors', async () => {
			await renderPage(showingAuthors);

			expect(within(screen.getByTestId('literary-works')).getAllByTestId('description')[0]).toHaveClass('line-clamp-3');
		});

		it('should clamp to four lines when the collection hides authors', async () => {
			await renderPage(hidingAuthors);

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
			await renderPage(showingAuthors);

			// eslint-disable-next-line testing-library/no-node-access -- el <head> no tiene rol accesible: se consulta por selector
			expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toContain(
				`/collection/${showingAuthors.slug}`,
			);
		});

		it('should emit both JSON-LD blocks', async () => {
			await renderPage(showingAuthors);

			/* eslint-disable testing-library/no-node-access -- el <head> no tiene rol accesible: se consulta por selector */
			expect(document.head.querySelector('script[data-schema-id="collection-page"]')).not.toBeNull();
			expect(document.head.querySelector('script[data-schema-id="breadcrumb-collection"]')).not.toBeNull();
			/* eslint-enable testing-library/no-node-access */
		});
	});
});
