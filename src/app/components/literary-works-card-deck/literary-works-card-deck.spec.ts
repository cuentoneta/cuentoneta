import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';

import { LiteraryWorksCardDeck } from './literary-works-card-deck';
import { onoffLiteraryWorkNavigationTeasersWithAuthorsMock } from '@mocks/onoff-literary-work-teasers.mock';

const literaryWorks = onoffLiteraryWorkNavigationTeasersWithAuthorsMock.slice(0, 6);

describe('LiteraryWorksCardDeck', () => {
	const defaultProviders = [provideRouter([])];
	const defaultInputs = { literaryWorks, heading: 'Últimas novedades' };

	it('should render the component', async () => {
		const { container } = await render(LiteraryWorksCardDeck, {
			inputs: { ...defaultInputs, literaryWorks: literaryWorks.slice(0, 1) },
			providers: defaultProviders,
		});
		expect(container).toBeTruthy();
	});

	describe('Estados del listado', () => {
		it('should fill the grid with skeletons while loading', async () => {
			await render(LiteraryWorksCardDeck, {
				inputs: { ...defaultInputs, loading: true },
				providers: defaultProviders,
			});

			expect(screen.getAllByTestId('skeleton')).toHaveLength(6);
			expect(screen.queryAllByTestId('card')).toHaveLength(0);
		});

		// Cargar gana sobre tener datos: mientras el recurso está en vuelo, lo que hay en pantalla es del
		// listado anterior y mostrarlo como definitivo haría parpadear contenido que va a cambiar.
		it('should show skeletons while loading even if it already holds works', async () => {
			await render(LiteraryWorksCardDeck, {
				inputs: { ...defaultInputs, loading: true, literaryWorks },
				providers: defaultProviders,
			});

			expect(screen.queryAllByTestId('card')).toHaveLength(0);
		});

		it('should render one card per work once it is loaded', async () => {
			await render(LiteraryWorksCardDeck, {
				inputs: defaultInputs,
				providers: defaultProviders,
			});

			literaryWorks.forEach(({ title }) => {
				expect(screen.getByText(title)).toBeInTheDocument();
			});
			expect(screen.getAllByTestId('card')).toHaveLength(literaryWorks.length);
			expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
		});

		// Sin obras y sin carga la sección no queda en blanco: si lo hiciera, se leería como contenido que
		// nunca terminó de llegar.
		it('should explain the emptiness when there is nothing to show', async () => {
			await render(LiteraryWorksCardDeck, {
				inputs: { ...defaultInputs, literaryWorks: [], emptyMessage: 'Todavía no hay obras nuevas esta semana.' },
				providers: defaultProviders,
			});

			expect(screen.getByText('Todavía no hay obras nuevas esta semana.')).toBeInTheDocument();
			expect(screen.queryAllByTestId('card')).toHaveLength(0);
			expect(screen.queryAllByTestId('skeleton')).toHaveLength(0);
		});
	});

	// El número es un ranking, así que solo tiene sentido donde la tirada ordena por algo. El diseño lo
	// muestra en más leídas y no en novedades.
	describe('Numeración de las tarjetas', () => {
		it('should number the cards by position when asked to', async () => {
			await render(LiteraryWorksCardDeck, {
				inputs: { ...defaultInputs, numbered: true },
				providers: defaultProviders,
			});

			expect(screen.getAllByTestId('order').map((order) => order.textContent?.trim())).toEqual([
				'1',
				'2',
				'3',
				'4',
				'5',
				'6',
			]);
		});

		it('should number nothing by default', async () => {
			await render(LiteraryWorksCardDeck, {
				inputs: defaultInputs,
				providers: defaultProviders,
			});

			expect(screen.queryAllByTestId('order')).toHaveLength(0);
		});
	});

	// La tarjeta enlaza a la ruta de lectura: es el único camino que la home ofrece hacia una obra desde
	// este bloque, y de él depende que la página emita enlaces internos.
	it('links every card to the reading route', async () => {
		await render(LiteraryWorksCardDeck, {
			inputs: defaultInputs,
			providers: defaultProviders,
		});

		const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
		literaryWorks.forEach(({ slug }) => {
			expect(hrefs.some((href) => href?.startsWith(`/read/${slug}`))).toBe(true);
		});
	});

	describe('Encabezado parametrizado', () => {
		// Desde el primer render, sin esperar al contenido: el encabezado es lo que da contexto a la
		// grilla mientras carga.
		it('should display the heading it receives', async () => {
			await render(LiteraryWorksCardDeck, {
				inputs: { ...defaultInputs, heading: 'Obras más leídas' },
				providers: defaultProviders,
			});

			expect(screen.getByRole('heading', { name: 'Obras más leídas', level: 2 })).toBeInTheDocument();
		});

		it('should point the action to the destination it receives', async () => {
			await render(LiteraryWorksCardDeck, {
				inputs: {
					...defaultInputs,
					action: { link: ['/', 'literary-work'], accessibleSuffix: 'el catálogo de obras' },
				},
				providers: defaultProviders,
			});

			expect(screen.getByRole('link', { name: 'Ver todo el catálogo de obras' })).toHaveAttribute(
				'href',
				'/literary-work',
			);
		});

		// El deck se puede montar en una página que ya anuncia la sección por su cuenta: ahí no debe
		// imponer un encabezado propio ni una región sin nombre.
		it('should render no header when it receives neither heading nor subtitle', async () => {
			await render(LiteraryWorksCardDeck, {
				inputs: { literaryWorks },
				providers: defaultProviders,
			});

			expect(screen.queryAllByRole('heading')).toHaveLength(0);
			expect(screen.queryAllByRole('region')).toHaveLength(0);
		});

		it('should render the header when it only receives a subtitle', async () => {
			await render(LiteraryWorksCardDeck, {
				inputs: { literaryWorks, subtitle: 'Explorá los textos más populares entre los lectores' },
				providers: defaultProviders,
			});

			expect(screen.getByText('Explorá los textos más populares entre los lectores')).toBeInTheDocument();
			expect(screen.queryAllByRole('heading')).toHaveLength(0);
		});

		it('should name its region after the heading', async () => {
			await render(LiteraryWorksCardDeck, {
				inputs: { ...defaultInputs, heading: 'Obras más leídas' },
				providers: defaultProviders,
			});

			expect(screen.getByRole('region', { name: 'Obras más leídas' })).toBeInTheDocument();
		});
	});
});
