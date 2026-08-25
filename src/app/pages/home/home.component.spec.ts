import HomeComponent from './home.component';
import { render, screen } from '@testing-library/angular';
import { CommonModule, NgForOf, NgIf, NgOptimizedImage } from '@angular/common';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideContentApiMock, StubContentApi } from '../../providers/content.mock';
import { Component, input } from '@angular/core';
import { Storylist } from '@models/storylist.model';
import { map, type Observable } from 'rxjs';
import type { ContentApi } from '../../providers/content.provider';
import type { LandingPageContent } from '@models/landing-page-content.model';
import type { HighlightedAuthor } from '@models/landing-page-content.model';
import { onoffHighlightedAuthorsOfLength } from '@mocks/onoff-highlighted-authors.mock';

describe.skip('HomeComponent', () => {
	const setup = async () => {
		return await render(HomeComponent, {
			componentImports: [
				CommonModule,
				HttpClientTestingModule,
				NgForOf,
				NgIf,
				NgOptimizedImage,
				MockStorylistCardDeckComponent,
			],
			providers: [provideRouter([]), provideContentApiMock()],
		});
	};

	it('should create', async () => {
		const view = setup();
		expect(view).toBeTruthy();
	});
});

@Component({
	standalone: true,
	selector: 'cuentoneta-storylist-card-deck:not(p)',
	imports: [],
	template: '',
})
class MockStorylistCardDeckComponent {
	public readonly storylist = input<Storylist>();
	public readonly isLoading = input<boolean>(false);
}

// El doble canned del provider entrega la landing vacía; acá solo se le pone contenido a los destacados,
// que es lo único que esta sección deriva.
class StubHighlightedAuthorsContentApi implements ContentApi {
	constructor(private readonly highlightedAuthors: readonly HighlightedAuthor[]) {}

	public getLandingPageContent(): Observable<LandingPageContent> {
		return new StubContentApi()
			.getLandingPageContent()
			.pipe(map((content) => ({ ...content, highlightedAuthors: this.highlightedAuthors })));
	}
}

describe('HomeComponent — autores destacados', () => {
	const renderHome = (highlightedAuthors: readonly HighlightedAuthor[]) =>
		render(HomeComponent, {
			providers: [provideRouter([]), provideContentApiMock(new StubHighlightedAuthorsContentApi(highlightedAuthors))],
		});

	it('should render the highlighted authors section header', async () => {
		await renderHome(onoffHighlightedAuthorsOfLength(6));

		expect(screen.getByRole('heading', { name: 'Autores/as destacados/as', level: 2 })).toBeInTheDocument();
	});

	// La cabecera y su enlace quedan fuera del bloque diferido, así que se renderizan en el HTML servido:
	// es lo que hace que la home enlace al índice de autores sin depender de que el cliente hidrate.
	it('should link to the authors index from the home', async () => {
		await renderHome(onoffHighlightedAuthorsOfLength(6));

		expect(screen.getByRole('link', { name: 'Ver todo' })).toHaveAttribute('href', '/authors');
	});

	it('should render the section even when the week has no highlighted authors', async () => {
		await renderHome([]);

		expect(screen.getByRole('heading', { name: 'Autores/as destacados/as', level: 2 })).toBeInTheDocument();
	});
});
