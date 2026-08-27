import HomeComponent from './home.component';
import { render, screen, within } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { map, NEVER, throwError, type Observable } from 'rxjs';
import { RESPONSE_INIT, type Provider } from '@angular/core';

import { provideContentApiMock, StubContentApi } from '../../providers/content.mock';
import type { ContentApi } from '../../providers/content.provider';
import { LayoutService } from '../../providers/layout.interface';
import { ControllableLayoutService } from '../../providers/layout.mock';
import type { LandingPageContent } from '@models/landing-page-content.model';
import { onoffHighlightedAuthorsOfLength } from '@mocks/onoff-highlighted-authors.mock';
import { onoffLiteraryWorkNavigationTeasersWithAuthorsMock } from '@mocks/onoff-literary-work-teasers.mock';
import { onoffCollectionTeasersMock, onoffCollectionTeasersOfLength } from '@mocks/onoff-collections.mock';
import { contentCampaignMock } from '@mocks/content-campaign.mock';
import { clearAllMocks } from '@test-utils';

// El doble canned del provider entrega la landing vacía; cada caso le superpone solo las secciones
// que ejercita, para que lo que no declara quede demostrablemente en cero.
class StubLandingPageContentApi implements ContentApi {
	private readonly canned = new StubContentApi();

	constructor(private readonly content: Partial<LandingPageContent>) {}

	public getLandingPageContent(): Observable<LandingPageContent> {
		return this.canned.getLandingPageContent().pipe(map((canned) => ({ ...canned, ...this.content })));
	}
}

// El contrato de la landing no tiene forma de expresar "no se pudo averiguar": el recurso libera el
// bloqueo del SSR también cuando el stream falla, así que el fallo hay que producirlo desde el stream.
class FailingContentApi implements ContentApi {
	public getLandingPageContent(): Observable<LandingPageContent> {
		return throwError(() => new Error('sin contenido de la semana'));
	}
}

// El stream nunca emite, así que el recurso queda en carga: es el estado que el SSR ya resolvió, pero
// que el cliente sí atraviesa al navegar hacia la página.
class PendingContentApi implements ContentApi {
	public getLandingPageContent(): Observable<LandingPageContent> {
		return NEVER;
	}
}

const renderWithApi = (api: ContentApi, providers: Provider[] = []) =>
	render(HomeComponent, {
		providers: [
			provideRouter([]),
			provideContentApiMock(api),
			// El carrusel deriva el viewport del layout, y su token no tiene factory: sin el doble, montarlo
			// deja el render en un fallo de inyección.
			{ provide: LayoutService, useClass: ControllableLayoutService },
			...providers,
		],
	});

const renderHome = (content: Partial<LandingPageContent> = {}) => renderWithApi(new StubLandingPageContentApi(content));

describe('HomeComponent', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	describe('encabezado de la página', () => {
		// El H1 de la página lo aporta el hero. La suite de indexado exige un H1 con texto real dentro de
		// <main>, así que la banda no puede quedar fuera del contenido primario.
		it('should carry a visible level 1 heading', async () => {
			await renderHome();

			expect(
				screen.getByRole('heading', { level: 1, name: 'Un espacio para explorar y descubrir nuevas obras' }),
			).toBeInTheDocument();
		});

		it('should carry exactly one level 1 heading', async () => {
			await renderHome();

			expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
		});
	});

	describe('mazos de obras', () => {
		// Rebanadas disjuntas del corpus: es lo que permite afirmar cuál de los dos listados llegó a cada
		// mazo, y no solo cuántas tarjetas hay en total.
		const latestReads = onoffLiteraryWorkNavigationTeasersWithAuthorsMock.slice(0, 3);
		const mostRead = onoffLiteraryWorkNavigationTeasersWithAuthorsMock.slice(3, 6);

		// Los dos mazos marcan sus tarjetas con el mismo `card`, así que el discriminante es el nombre de
		// región de cada uno: por orden de documento, el caso dejaría de valer al reordenar las secciones.
		it('should hand each listing to its own deck', async () => {
			await renderHome({ latestReads, mostRead });

			expect(screen.getAllByTestId('card')).toHaveLength(latestReads.length + mostRead.length);
			(
				[
					['Últimas novedades', latestReads],
					['Obras más leídas', mostRead],
				] as const
			).forEach(([sectionName, listing]) => {
				const deck = within(screen.getByRole('region', { name: sectionName }));
				const cards = deck.getAllByTestId('card');

				expect(cards).toHaveLength(listing.length);
				listing.forEach((literaryWork, index) => {
					expect(within(cards[index]).getByText(literaryWork.title)).toBeInTheDocument();
				});
			});
		});

		// Las cabeceras quedan fuera de la rama de carga: son lo que la página lleva servido aunque las
		// tarjetas todavía no se hayan resuelto.
		it('should render both deck headings from the very first render', async () => {
			await renderHome({ latestReads, mostRead });

			expect(screen.getByRole('heading', { level: 2, name: 'Últimas novedades' })).toBeInTheDocument();
			expect(screen.getByRole('heading', { level: 2, name: 'Obras más leídas' })).toBeInTheDocument();
		});

		// Afirmar cuáles obras quedaron afuera —y no solo cuántas tarjetas hay— es lo que distingue el
		// recorte de cualquier otro criterio que devolviera seis. De ahí que el caso empiece exigiendo que
		// el corpus supere el tope: con uno más corto no habría descarte que observar.
		describe.each(['latestReads', 'mostRead'] as const)('recorte de %s', (section) => {
			it('should cap the listing at six, however many the week brings', async () => {
				expect(onoffLiteraryWorkNavigationTeasersWithAuthorsMock.length).toBeGreaterThan(6);

				await renderHome({
					[section]: [...onoffLiteraryWorkNavigationTeasersWithAuthorsMock],
				});

				expect(screen.getAllByTestId('card')).toHaveLength(6);
				onoffLiteraryWorkNavigationTeasersWithAuthorsMock.slice(6).forEach(({ title }) => {
					expect(screen.queryByText(title)).not.toBeInTheDocument();
				});
			});
		});
	});

	describe('colecciones', () => {
		const collections = onoffCollectionTeasersMock;

		it('should render every collection of the week', async () => {
			await renderHome({ collections });

			collections.forEach(({ title }) => {
				expect(screen.getByText(title)).toBeInTheDocument();
			});
		});

		// Mismo criterio que el recorte a seis de las obras: se afirma cuáles quedaron afuera, porque
		// contar cuatro se cumpliría igual con cualquier otro criterio que devolviera cuatro.
		it('should cap the grid at four, however many the week brings', async () => {
			const manyCollections = onoffCollectionTeasersOfLength(6);

			await renderHome({ collections: manyCollections });

			manyCollections.slice(0, 4).forEach(({ title }) => expect(screen.getByText(title)).toBeInTheDocument());
			manyCollections.slice(4).forEach(({ title }) => expect(screen.queryByText(title)).not.toBeInTheDocument());
		});
	});

	// El orden lo fija el diseño, y el spec lo afirma sobre el documento porque es lo único que lo
	// distingue: las cuatro secciones se ven iguales si solo se cuentan sus encabezados.
	describe('orden de las secciones', () => {
		it('should lay the sections out in the order of the design', async () => {
			await renderHome();

			const headings = screen
				.getAllByRole('heading', { level: 2 })
				.map((heading) => heading.textContent?.trim())
				.filter((title) => title !== 'Sobre La Cuentoneta');

			expect(headings).toEqual(['Últimas novedades', 'Autores/as destacados/as', 'Obras más leídas', 'Colecciones']);
		});
	});

	describe('campañas', () => {
		it('should hand the campaigns of the week to the carousel', async () => {
			const [firstCampaign] = contentCampaignMock;
			await renderHome({ campaigns: contentCampaignMock });

			expect(screen.getByRole('region', { name: 'Content campaigns' })).toBeInTheDocument();
			// El carrusel dibuja solo la diapositiva activa, así que la campaña observable es la primera.
			expect(screen.getByAltText(`Imagen de la campaña de contenido ${firstCampaign.title}`)).toBeInTheDocument();
		});
	});

	describe('autores destacados', () => {
		it('should render the highlighted authors section header', async () => {
			await renderHome({ highlightedAuthors: onoffHighlightedAuthorsOfLength(6) });

			expect(screen.getByRole('heading', { name: 'Autores/as destacados/as', level: 2 })).toBeInTheDocument();
		});

		// La cabecera y su enlace quedan fuera de la rama de carga, así que se renderizan en el HTML servido:
		// es lo que hace que la home enlace al índice de autores sin depender de que el cliente hidrate.
		it('should link to the authors index from the home', async () => {
			await renderHome({ highlightedAuthors: onoffHighlightedAuthorsOfLength(6) });

			expect(screen.getByRole('link', { name: 'Ver todo el índice de autores' })).toHaveAttribute('href', '/authors');
		});

		it('should hand every highlighted author to the grid', async () => {
			const highlightedAuthors = onoffHighlightedAuthorsOfLength(6);
			await renderHome({ highlightedAuthors });

			highlightedAuthors.forEach(({ author }) => {
				expect(screen.getByText(author.name)).toBeInTheDocument();
			});
		});

		it('should render the section even when the week has no highlighted authors', async () => {
			await renderHome({ highlightedAuthors: [] });

			expect(screen.getByRole('heading', { name: 'Autores/as destacados/as', level: 2 })).toBeInTheDocument();
		});
	});

	// La landing sale vacía mientras la edición no cargó la semana, y es un estado que se sirve: la página
	// tiene que sostener su estructura y decir qué falta, en vez de dejar huecos que se leen como carga
	// que nunca terminó.
	describe('semana sin contenido', () => {
		it('should keep every section heading when the week brings nothing', async () => {
			await renderHome();

			['Últimas novedades', 'Obras más leídas', 'Colecciones', 'Autores/as destacados/as'].forEach((name) => {
				expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
			});
		});

		// Las cuatro acciones se afirman con la semana vacía porque es el caso en que un enlace
		// condicionado al dato desaparecería sin que ningún otro caso lo note.
		it('should offer every section its way out to the full index', async () => {
			await renderHome();

			(
				[
					['Ver todo el catálogo de obras', '/literary-work'],
					['Ver todo el índice de autores', '/authors'],
					['Ver todo el índice de colecciones', '/collection'],
				] as const
			).forEach(([name, href]) => {
				screen.getAllByRole('link', { name }).forEach((link) => expect(link).toHaveAttribute('href', href));
			});

			// Las dos secciones de obras comparten hub, así que comparten nombre accesible.
			expect(screen.getAllByRole('link', { name: 'Ver todo el catálogo de obras' })).toHaveLength(2);
		});

		// Las tres clases de tarjeta —obra, colección y autor— se dibujan como `article`, así que la
		// ausencia de ese rol cubre a las tres a la vez. El carrusel es el único bloque que sin contenido
		// no se monta: un carrusel de cero diapositivas no es un estado que exista.
		it('should render neither cards nor a carousel when the week brings nothing', async () => {
			await renderHome();

			expect(screen.queryAllByRole('article')).toHaveLength(0);
			expect(screen.queryByRole('region', { name: 'Content campaigns' })).not.toBeInTheDocument();
		});

		// Cada deck dice lo suyo: un único mensaje compartido no distinguiría qué sección quedó sin
		// contenido, que es justamente lo que la página tiene que comunicar.
		it('should explain what is missing in each deck', async () => {
			await renderHome();

			[
				'Todavía no hay obras nuevas esta semana.',
				'Todavía no hay obras más leídas para mostrar.',
				'Todavía no hay autores destacados esta semana.',
				'Todavía no hay colecciones para mostrar esta semana.',
			].forEach((message) => {
				expect(screen.getByText(message)).toBeInTheDocument();
			});
		});

		// El HTML servido no debe llevar marcadores de esqueleto: el recurso bloquea el SSR, así que para
		// cuando la página se serializa el estado de carga ya terminó. Es el invariante que la suite de
		// indexado afirma sobre la página real.
		it('should render no skeleton markers once the resource settled', async () => {
			await renderHome();

			expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
		});
	});

	// El estado de carga lo decide la página y lo consumen los cuatro decks: sin este bloque, desconectar
	// ese cableado de cualquiera de ellos no rompería nada.
	describe('contenido en vuelo', () => {
		it('should fill every deck with skeletons while the resource is loading', async () => {
			await renderWithApi(new PendingContentApi());

			// Seis por cada deck de obras y por el de autores, cuatro por el de colecciones.
			expect(screen.getAllByTestId('skeleton')).toHaveLength(22);
			expect(screen.queryAllByTestId('empty-state')).toHaveLength(0);
		});

		it('should claim nothing is missing while it is still loading', async () => {
			await renderWithApi(new PendingContentApi());

			expect(screen.queryByText('Todavía no hay obras nuevas esta semana.')).not.toBeInTheDocument();
		});
	});

	// Un fallo del recurso llega con el contenido vacío, igual que una semana sin cargar. Distinguirlos es
	// lo que evita que la página afirme que no hay obras cuando lo que pasó es que no se pudo averiguar.
	describe('el contenido no se pudo cargar', () => {
		it('should say that it could not load instead of claiming the week is empty', async () => {
			await renderWithApi(new FailingContentApi());

			expect(screen.getByTestId('landing-error')).toBeInTheDocument();
			expect(screen.queryByText('Todavía no hay obras nuevas esta semana.')).not.toBeInTheDocument();
			expect(screen.queryAllByTestId('empty-state')).toHaveLength(0);
		});

		// Un fallo transitorio no puede salir 200: el borde lo cachearía como si fuera la página.
		it('should answer with a server error status', async () => {
			const responseInit: { status?: number } = {};

			await renderWithApi(new FailingContentApi(), [{ provide: RESPONSE_INIT, useValue: responseInit }]);

			expect(responseInit.status).toBe(503);
		});

		it('should leave the status untouched when the content loads', async () => {
			const responseInit: { status?: number } = {};

			await renderWithApi(new StubLandingPageContentApi({}), [{ provide: RESPONSE_INIT, useValue: responseInit }]);

			expect(responseInit.status).toBeUndefined();
		});

		// El texto introductorio no depende del contenido de la semana, así que la página sigue teniendo
		// cuerpo indexable aunque el backend falle.
		it('should keep the introductory content', async () => {
			await renderWithApi(new FailingContentApi());

			expect(screen.getByRole('heading', { name: 'Sobre La Cuentoneta', level: 2 })).toBeInTheDocument();
		});
	});
});
