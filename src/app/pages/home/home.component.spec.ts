import HomeComponent from './home.component';
import { render, screen, within } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { map, type Observable } from 'rxjs';

import { provideContentApiMock, StubContentApi } from '../../providers/content.mock';
import type { ContentApi } from '../../providers/content.provider';
import { LayoutService } from '../../providers/layout.interface';
import { ControllableLayoutService } from '../../providers/layout.mock';
import type { LandingPageContent } from '@models/landing-page-content.model';
import { onoffHighlightedAuthorsOfLength } from '@mocks/onoff-highlighted-authors.mock';
import { onoffLiteraryWorkNavigationTeasersWithAuthorsMock } from '@mocks/onoff-literary-work-teasers.mock';
import { onoffCollectionTeasersMock } from '@mocks/onoff-collections.mock';
import type { CollectionTeaser } from '@models/collection.model';
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

const renderHome = (content: Partial<LandingPageContent> = {}) =>
	render(HomeComponent, {
		providers: [
			provideRouter([]),
			provideContentApiMock(new StubLandingPageContentApi(content)),
			// El carrusel deriva el viewport del layout, y su token no tiene factory: sin el doble,
			// resolver el diferido de campañas deja el render en un fallo de inyección.
			{ provide: LayoutService, useClass: ControllableLayoutService },
		],
	});

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

		// La imagen editorial de la colección: las que solo tienen portadas prestadas de sus obras no
		// suben a la banda, porque esas mismas portadas ya se ven más abajo en la propia página.
		it('should illustrate the hero with the covers of the featured collections', async () => {
			const collections = onoffCollectionTeasersMock;
			const editorialCovers = collections.flatMap((collection) =>
				collection.imagery.kind === 'representative' ? [collection.imagery.image] : [],
			);
			expect(editorialCovers.length).toBeGreaterThan(0);

			await renderHome({ collections });

			const hero = within(screen.getByTestId('hero-covers'));
			expect(hero.getAllByTestId('cover-image').map((cover) => cover.getAttribute('src'))).toEqual(
				editorialCovers.slice(0, 3),
			);
		});

		// El corpus tiene una sola colección con imagen editorial, así que el tope hay que ejercitarlo con
		// una semana construida: con el corpus tal cual, el recorte nunca llega a descartar nada.
		it('should cap the hero at three covers, however many collections bring one', async () => {
			const withEditorialCover = onoffCollectionTeasersMock.find(
				(collection) => collection.imagery.kind === 'representative',
			);
			expect(withEditorialCover).toBeDefined();
			const collections = Array.from({ length: 5 }, () => withEditorialCover as CollectionTeaser);

			await renderHome({ collections });

			expect(within(screen.getByTestId('hero-covers')).getAllByTestId('cover-image')).toHaveLength(3);
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

		// Las cabeceras quedan fuera de los bloques diferidos: son lo que la página lleva servido aunque
		// las tarjetas todavía no se hayan resuelto.
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

		// La cabecera y su enlace quedan fuera del bloque diferido, así que se renderizan en el HTML servido:
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
});
