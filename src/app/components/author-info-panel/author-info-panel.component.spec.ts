// Librería de pruebas
import { render, screen, within } from '@testing-library/angular';

// Componentes
import { AuthorInfoPanelComponent } from './author-info-panel.component';

// Mocks
import { authorMock } from '@mocks/author.mock';
import { cuentoTagMock, ensayoTagMock, novelaTagMock } from '@mocks/onoff-tags.mock';

// Modelos
import type { Author } from '@models/author.model';

// Utilidades de test
import { clearAllMocks, fn } from '@test-utils';
import { installResizeObserverStub, setMeasuredSize, triggerResize } from '@testing/resize-observer.stub';

const availableTags = [cuentoTagMock, novelaTagMock, ensayoTagMock];

function authorWithTags(count: number): Author {
	return { ...authorMock, tags: availableTags.slice(0, count) };
}

describe('AuthorInfoPanelComponent', () => {
	beforeEach(() => {
		clearAllMocks();
		installResizeObserverStub();
	});

	describe('sin autor', () => {
		it('should render its skeleton', async () => {
			await render(AuthorInfoPanelComponent);

			expect(screen.getByTestId('author-info-panel-skeleton')).toBeInTheDocument();
			expect(screen.queryByTestId('biography')).not.toBeInTheDocument();
		});
	});

	describe('con autor', () => {
		// El nombre es el encabezado de primer nivel de la página: la afirmación va por rol y nivel, no por
		// texto, porque lo que importa es la jerarquía que leen los crawlers y los lectores de pantalla.
		it('should render the name as the first level heading', async () => {
			await render(AuthorInfoPanelComponent, { inputs: { author: authorMock } });

			expect(screen.getByRole('heading', { level: 1, name: authorMock.name })).toBeInTheDocument();
		});

		// El panel deslizable ya nombra al autor en su etiqueta accesible: repetirlo daría dos h1 iguales.
		it('should omit the name when the consumer already shows it', async () => {
			await render(AuthorInfoPanelComponent, { inputs: { author: authorMock, showName: false } });

			expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
		});

		it('should render the country of the author', async () => {
			await render(AuthorInfoPanelComponent, { inputs: { author: authorMock } });

			expect(screen.getByText(authorMock.nationality.country)).toBeInTheDocument();
		});

		// La marcación tiene que sobrevivir: sin el bypass, el sanitizer de Angular recorta un HTML que el
		// backend ya acotó a su allow-list, y el énfasis de la prosa se pierde sin que nada falle.
		it('should preserve the markup of the sanitized biography', async () => {
			await render(AuthorInfoPanelComponent, { inputs: { author: authorMock } });

			const biography = screen.getByTestId('biography');
			expect(biography).not.toBeEmptyDOMElement();
			expect(within(biography).getAllByRole('paragraph').length).toBeGreaterThan(0);
			expect(within(biography).getByText(authorMock.name).tagName).toBe('STRONG');
		});

		// Todas las etiquetas del dominio, no la primera: recortar acá escondería en silencio las demás.
		// El corpus trae una sola por autor, así que el caso se deriva con tres — con una, una plantilla
		// que pintara `tags[0]` pasaría igual y el test no probaría nada.
		it('should render every tag of the author', async () => {
			const author = authorWithTags(3);
			await render(AuthorInfoPanelComponent, { inputs: { author } });

			const tags = screen.getByTestId('tags');
			expect(author.tags).toHaveLength(3);
			author.tags.forEach((tag) => expect(within(tags).getByText(tag.title)).toBeInTheDocument());
		});

		it('should omit the tag list when the author has none', async () => {
			await render(AuthorInfoPanelComponent, { inputs: { author: authorWithTags(0) } });

			expect(screen.queryByTestId('tags')).not.toBeInTheDocument();
		});
	});

	describe('recorte de la biografía', () => {
		// Cuántas líneas se muestran depende del alto de la columna que lo hospeda, así que lo decide el
		// consumidor: sin ese dato el panel no recorta.
		it('should not clamp when the consumer does not ask for it', async () => {
			await render(AuthorInfoPanelComponent, { inputs: { author: authorMock } });

			expect(screen.getByTestId('biography').className).not.toMatch(/line-clamp-/);
		});

		it('should clamp to the requested number of lines', async () => {
			await render(AuthorInfoPanelComponent, { inputs: { author: authorMock, biographyLines: 8 } });

			expect(screen.getByTestId('biography')).toHaveClass('line-clamp-8');
		});

		// El safelist de Tailwind llega hasta 10: pedir más produciría una clase que no existe.
		it('should cap the clamp at the highest safelisted value', async () => {
			await render(AuthorInfoPanelComponent, { inputs: { author: authorMock, biographyLines: 40 } });

			expect(screen.getByTestId('biography')).toHaveClass('line-clamp-10');
		});

		// Un decimal produciría `line-clamp-8.5`, una clase que no existe: el recorte desaparecería sin que
		// nada falle.
		it('should truncate a fractional number of lines', async () => {
			await render(AuthorInfoPanelComponent, { inputs: { author: authorMock, biographyLines: 8.5 } });

			expect(screen.getByTestId('biography')).toHaveClass('line-clamp-8');
		});

		it('should floor the clamp at the lowest safelisted value', async () => {
			await render(AuthorInfoPanelComponent, { inputs: { author: authorMock, biographyLines: 0 } });

			expect(screen.getByTestId('biography')).toHaveClass('line-clamp-1');
		});
	});

	describe('acceso a la biografía completa', () => {
		const overflowing = () => {
			setMeasuredSize(screen.getByTestId('biography'), { scrollHeight: 400, clientHeight: 160 });
			triggerResize();
		};

		const readMoreButton = () => screen.queryByRole('button', { name: 'Leer más' });

		it('should offer the access when the biography overflows its clamp', async () => {
			const { detectChanges } = await render(AuthorInfoPanelComponent, {
				inputs: { author: authorMock, biographyLines: 8, showReadMore: true },
			});

			overflowing();
			detectChanges();

			expect(readMoreButton()).toBeInTheDocument();
		});

		it('should report the request without applying it', async () => {
			const readMore = fn();
			const { detectChanges } = await render(AuthorInfoPanelComponent, {
				inputs: { author: authorMock, biographyLines: 8, showReadMore: true },
				on: { readMore },
			});
			overflowing();
			detectChanges();

			readMoreButton()?.click();

			expect(readMore).toHaveBeenCalledTimes(1);
		});

		// El montaje del panel deslizable muestra la biografía entera: ahí no hay nada más que leer.
		it('should not offer the access when the consumer does not ask for it', async () => {
			const { detectChanges } = await render(AuthorInfoPanelComponent, {
				inputs: { author: authorMock, biographyLines: 8 },
			});

			overflowing();
			detectChanges();

			expect(readMoreButton()).not.toBeInTheDocument();
		});

		it('should not offer the access when the biography fits', async () => {
			const { detectChanges } = await render(AuthorInfoPanelComponent, {
				inputs: { author: authorMock, biographyLines: 8, showReadMore: true },
			});

			setMeasuredSize(screen.getByTestId('biography'), { scrollHeight: 160, clientHeight: 160 });
			triggerResize();
			detectChanges();

			expect(readMoreButton()).not.toBeInTheDocument();
		});

		// Precondición de la directiva de medición: el control dentro del elemento observado cambiaría
		// justamente lo que se mide.
		it('should keep the access outside the measured element', async () => {
			const { detectChanges } = await render(AuthorInfoPanelComponent, {
				inputs: { author: authorMock, biographyLines: 8, showReadMore: true },
			});
			overflowing();
			detectChanges();

			expect(within(screen.getByTestId('biography')).queryByRole('button')).not.toBeInTheDocument();
		});
	});
});
