// Librería de pruebas
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { render, screen, within } from '@testing-library/angular';

// Página bajo prueba
import AuthorPage from './author.page';

// Mocks
import { authorMock } from '@mocks/author.mock';
import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { provideAuthorApiMock, StubAuthorApi } from '../../providers/author.mock';
import { provideLiteraryWorkApiMock, StubLiteraryWorkApi } from '../../providers/literary-work.mock';
import { withoutUrl } from '@testing/resource-without-url';

// Modelos
import type { AuthorProfile } from '@models/author.model';
import type { LiteraryWork, LiteraryWorkTeaser } from '@models/literary-work.model';
import type { LiteraryWorkApi } from '../../providers/literary-work.provider';

const [literaryWorkMock] = onoffLiteraryWorksMock;

// Los teasers del canon embeben al mismo autor que `authorMock`, así que el filtro por autor del doble
// devuelve el listado completo.
const worksByAuthor = onoffLiteraryWorkTeasersMock.filter(({ authors }) =>
	authors.some(({ slug }) => slug === authorMock.slug),
);

function renderPage(author: AuthorProfile = authorMock, literaryWorkApi?: LiteraryWorkApi) {
	return render(AuthorPage, {
		inputs: { slug: author.slug },
		providers: [
			provideRouter([]),
			provideAuthorApiMock(new StubAuthorApi(author)),
			provideLiteraryWorkApiMock(
				literaryWorkApi ?? new StubLiteraryWorkApi(literaryWorkMock, onoffLiteraryWorkTeasersMock),
			),
		],
	});
}

// El catálogo puede fallar con el autor resolviendo bien: es la combinación que un doble que devuelve
// siempre no alcanza a montar.
class StubFailingLiteraryWorkApi implements LiteraryWorkApi {
	public getBySlug(): Observable<LiteraryWork> {
		return throwError(() => new HttpErrorResponse({ status: 500, statusText: 'error' }));
	}

	public getTeasers(): Observable<LiteraryWorkTeaser[]> {
		return throwError(() => new HttpErrorResponse({ status: 500, statusText: 'error' }));
	}
}

describe('AuthorPage', () => {
	// Reproduce el modo de falla del SSR: las directivas de SEO son hostDirectives de la página, así que
	// un throw en su effect derriba el render entero y la ficha sale sin cuerpo. El ErrorHandler de
	// test-setup relanza, con lo cual acá se manifiesta igual que en el servidor.
	it('should keep its heading when a resource has no url', async () => {
		const [resource] = authorMock.resources;
		await renderPage({ ...authorMock, resources: [withoutUrl(resource)] });

		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(authorMock.name);
	});

	// La biografía llega como HTML ya saneado y se pinta con [innerHTML]: se verifica que el marcado
	// llegue vivo al DOM, no solo el texto, porque un binding interpolado también mostraría la prosa.
	it('should render the biography as HTML, preserving its markup', async () => {
		await renderPage();

		const biography = screen.getByTestId('biography');
		expect(within(biography).getByText(authorMock.name).tagName).toBe('STRONG');
	});

	it('should render one card per literary work of the author', async () => {
		await renderPage();

		const listing = screen.getByTestId('literary-works');
		expect(worksByAuthor.length).toBeGreaterThan(0);
		worksByAuthor.forEach((work) => expect(within(listing).getByText(work.title)).toBeInTheDocument());
	});

	// El perfil va primero en el DOM y último en la fila de escritorio. Sin eso, en mobile el lector
	// aterriza en el listado y encuentra al autor recién al final, y el esquema de encabezados abre con el
	// h2 en las dos anchuras.
	it('should lead with the author profile in document order', async () => {
		await renderPage();

		const [first, second] = screen.getAllByRole('heading');
		expect(first.tagName).toBe('H1');
		expect(second.tagName).toBe('H2');
	});

	it('should introduce the listing with the count of works', async () => {
		await renderPage();

		expect(screen.getByRole('heading', { level: 2, name: `${worksByAuthor.length} obras` })).toBeInTheDocument();
	});

	it('should name the count in singular when the author has one work', async () => {
		await renderPage(authorMock, new StubLiteraryWorkApi(literaryWorkMock, worksByAuthor.slice(0, 1)));

		expect(screen.getByRole('heading', { level: 2, name: '1 obra' })).toBeInTheDocument();
	});

	// El destino de lectura es /read: la página salió del mundo Story y sus enlaces también.
	it('should link each listed work to its reading page', async () => {
		await renderPage();

		const [firstWork] = worksByAuthor;
		const link = within(screen.getByTestId('literary-works')).getByRole('link', { name: firstWork.title });

		expect(link.getAttribute('href')).toContain(`/read/${firstWork.slug}`);
	});

	// La página de lectura deriva sus sugerencias de esta procedencia: sin el contexto, una lectura
	// llegada desde la ficha pierde de dónde vino.
	it('should link each listed work carrying the author as navigation context', async () => {
		await renderPage();

		const [firstWork] = worksByAuthor;
		const link = within(screen.getByTestId('literary-works')).getByRole('link', { name: firstWork.title });

		expect(link.getAttribute('href')).toBe(
			`/read/${firstWork.slug}?navigation=author&navigationSlug=${authorMock.slug}`,
		);
	});

	// Leer el valor de un recurso en error relanza la falla. Con el listado bloqueando el SSR, ese throw
	// derriba el render del servidor de una página indexable; el autor resuelto tiene que bastar para
	// servir la ficha.
	it('should still serve the profile when the works catalogue fails', async () => {
		await renderPage(authorMock, new StubFailingLiteraryWorkApi());

		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(authorMock.name);
		expect(screen.getByRole('heading', { level: 2, name: '0 obras' })).toBeInTheDocument();
	});
});
