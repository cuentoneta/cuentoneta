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
import { onoffStoryNavigationTeasersWithAuthorMock } from '@mocks/onoff-story-teasers.mock';
import { storylistTeaserRepresentativeMock } from '@mocks/storylist.mock';
import { contentCampaignMock } from '@mocks/content-campaign.mock';
import { renderDeferBlocks } from '@testing/defer-blocks';
import { clearAllMocks } from '@test-utils';

// El doble canned del provider entrega la landing vacía; cada caso le superpone solo las secciones
// que ejercita, para que lo que no declara quede demostrablemente en cero.
class StubLandingPageContentApi implements ContentApi {
	constructor(private readonly content: Partial<LandingPageContent>) {}

	public getLandingPageContent(): Observable<LandingPageContent> {
		return new StubContentApi().getLandingPageContent().pipe(map((canned) => ({ ...canned, ...this.content })));
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

	describe('mazos de historias', () => {
		// Rebanadas disjuntas del corpus: es lo que permite afirmar cuál de los dos listados llegó a cada
		// mazo, y no solo cuántas tarjetas hay en total.
		const latestReads = onoffStoryNavigationTeasersWithAuthorMock.slice(0, 3);
		const mostRead = onoffStoryNavigationTeasersWithAuthorMock.slice(3, 6);

		// Los dos mazos marcan sus tarjetas con el mismo `card`, así que el discriminante es el orden de
		// documento: el de novedades precede al de más leídas en la plantilla, que es el orden de lectura.
		it('should hand each listing to its own deck', async () => {
			const { fixture } = await renderHome({ latestReads, mostRead });

			await renderDeferBlocks(fixture);

			const cards = screen.getAllByTestId('card');
			expect(cards).toHaveLength(latestReads.length + mostRead.length);
			[...latestReads, ...mostRead].forEach((story, index) => {
				expect(within(cards[index]).getByText(story.title)).toBeInTheDocument();
			});
		});

		// Las cabeceras quedan fuera de los bloques diferidos: son lo que la página lleva servido aunque
		// las tarjetas todavía no se hayan resuelto.
		it('should render both deck headings from the very first render', async () => {
			await renderHome({ latestReads, mostRead });

			expect(screen.getByRole('heading', { level: 2, name: 'Últimas novedades' })).toBeInTheDocument();
			expect(screen.getByRole('heading', { level: 2, name: 'Historias más leídas' })).toBeInTheDocument();
		});

		// El corpus trae ocho obras, así que el recorte deja fuera dos identificables: sin afirmar cuáles,
		// el caso pasaría igual si la página recortara por otro criterio.
		it('should cap the latest reads at six, however many the week brings', async () => {
			const { fixture } = await renderHome({ latestReads: [...onoffStoryNavigationTeasersWithAuthorMock] });

			await renderDeferBlocks(fixture);

			expect(screen.getAllByTestId('card')).toHaveLength(6);
			onoffStoryNavigationTeasersWithAuthorMock.slice(6).forEach(({ title }) => {
				expect(screen.queryByText(title)).not.toBeInTheDocument();
			});
		});

		it('should cap the most read at six, however many the week brings', async () => {
			const { fixture } = await renderHome({ mostRead: [...onoffStoryNavigationTeasersWithAuthorMock] });

			await renderDeferBlocks(fixture);

			expect(screen.getAllByTestId('card')).toHaveLength(6);
			onoffStoryNavigationTeasersWithAuthorMock.slice(6).forEach(({ title }) => {
				expect(screen.queryByText(title)).not.toBeInTheDocument();
			});
		});
	});

	describe('colecciones', () => {
		// El corpus todavía no deriva teasers de `Storylist` (la landing cruda trae `cards: []`), así que
		// las variantes salen del mismo mock heredado que usa el spec del mazo.
		const cards = ['Geometrías del desvelo', 'El palacio de las nueve fronteras'].map((title, index) => ({
			...storylistTeaserRepresentativeMock,
			_id: `storylist-mock-${index + 1}`,
			title,
			slug: `coleccion-${index + 1}`,
		}));

		it('should hand every collection card to the collections deck', async () => {
			const { fixture } = await renderHome({ cards });

			await renderDeferBlocks(fixture);

			cards.forEach(({ title }) => {
				expect(screen.getByText(title)).toBeInTheDocument();
			});
		});
	});

	describe('campañas', () => {
		it('should hand the campaigns of the week to the carousel', async () => {
			const [firstCampaign] = contentCampaignMock;
			const { fixture } = await renderHome({ campaigns: contentCampaignMock });

			await renderDeferBlocks(fixture);

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

			expect(screen.getByRole('link', { name: 'Ver todos los autores' })).toHaveAttribute('href', '/authors');
		});

		it('should hand every highlighted author to the grid', async () => {
			const highlightedAuthors = onoffHighlightedAuthorsOfLength(6);
			const { fixture } = await renderHome({ highlightedAuthors });

			await renderDeferBlocks(fixture);

			highlightedAuthors.forEach(({ author }) => {
				expect(screen.getByText(author.name)).toBeInTheDocument();
			});
		});
		it('should render the section even when the week has no highlighted authors', async () => {
			await renderHome({ highlightedAuthors: [] });

			expect(screen.getByRole('heading', { name: 'Autores/as destacados/as', level: 2 })).toBeInTheDocument();
		});
	});
});
