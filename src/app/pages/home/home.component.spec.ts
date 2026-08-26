import HomeComponent from './home.component';
import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { map, type Observable } from 'rxjs';

import { provideContentApiMock, StubContentApi } from '../../providers/content.mock';
import type { ContentApi } from '../../providers/content.provider';
import { LayoutService } from '../../providers/layout.interface';
import { ControllableLayoutService } from '../../providers/layout.mock';
import type { LandingPageContent } from '@models/landing-page-content.model';
import { onoffHighlightedAuthorsOfLength } from '@mocks/onoff-highlighted-authors.mock';
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

		it('should render the section even when the week has no highlighted authors', async () => {
			await renderHome({ highlightedAuthors: [] });

			expect(screen.getByRole('heading', { name: 'Autores/as destacados/as', level: 2 })).toBeInTheDocument();
		});
	});
});
